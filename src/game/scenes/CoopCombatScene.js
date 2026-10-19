import { Scene } from "phaser";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { EventBus } from "../EventBus";
import Player from "../characters/Player";
import RemotePlayer from "../characters/RemotePlayer";
import Enemy from "../characters/Enemy";
import { getCharacter, getUltimateConfig } from "../../service/playerApi";
import { getPlayerById } from "../../service/playerApi";
import { generateCharacterFrames } from "../../components/molecules/characterSVG";
import { loadEnemyTextures } from "../../components/molecules/enemySVG";
import {
    connectToRoom,
    sendInput,
    disconnectFromRoom,
} from "../../service/coopSocket";

export default class CoopCombatScene extends Scene {
    constructor() {
        super({
            key: "CoopCombatScene",
            physics: {
                arcade: {
                    gravity: { y: 800 },
                    debug: false,
                    fps: 60,
                },
            },
        });
    }

    init(data) {
        this.roomId = data?.roomId ?? null;
        this.localPlayerId = data?.playerId ?? null;
        this.localPlayer = null;
        this.remotePlayers = new Map();
        this._loadingPlayers = new Set();
        this.enemy = null;
        this.stompClient = null;
        this.inputTick = 0;
        this.lastSentInput = null;
        this.combatFinished = false;
        this.isCoop = true;
        this._ultimateLockUntil = 0;
        this._lastHealth = new Map();
        this.ultimateOutcomes = {};
        this._lastUltimateCount = undefined;
    }

    async create() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor("#020408").fadeIn(500);
        this._createSceneTextures();
        this._createBackground(width, height);
        this.platforms = this._createPlatforms(width, height);
        await loadEnemyTextures(this);
        await this._initLocalPlayer(width, height);
        this._connectWebSocket();
        EventBus.emit("current-scene-ready", this);
        this.events.once("shutdown", () => this._cleanup());
    }

    async _initLocalPlayer(width, height) {
        try {
            const [serverData, ultimateConfig] = await Promise.all([
                getCharacter(),
                getUltimateConfig(),
            ]);
            this.registry.set("character", serverData);
            this.registry.set("ultimateConfig", ultimateConfig);
            const localTextureKey = `local_player_${this.localPlayerId}`;
            await this._ensurePlayerTexture(serverData, localTextureKey);
            this.localPlayer = new Player(
                this,
                200,
                height - 90,
                localTextureKey,
            );
            this.localPlayer.body.setAllowGravity(false);
            this.localPlayer.body.setImmovable(true);
            this.physics.add.collider(this.localPlayer, this.platforms);
            EventBus.emit("player-name", {
                name: serverData.username || "PLAYER",
            });
            this.localPlayer.on("healthChanged", () => this._updateUI());
            this.localPlayer.on("died", () => this._onLocalPlayerDied());
            this._spawnEnemy();
        } catch (err) {
            console.error("Error cargando personaje:", err);
        }
    }

    _connectWebSocket() {
        connectToRoom(this.roomId, (state) => this._applyServerState(state));
    }

    _sendInput(action) {
        const isEvent = ["ATTACK", "ULTIMATE", "RANGED"].includes(action);
        if (isEvent && action === this.lastSentInput) return;
        this.lastSentInput = action;
        sendInput(this.roomId, this.localPlayerId, action, this.inputTick++);
    }

    async _applyServerState(state) {
        if (!state?.players) return;
        this.ultimateOutcomes = state.outcomes ?? {};
        for (const [pid, pState] of Object.entries(state.players)) {
            const playerIdStr = String(pid);
            const localIdStr = String(this.localPlayerId);
            this._trackHealth(
                playerIdStr,
                pState.health,
                playerIdStr === localIdStr
                    ? this.localPlayer
                    : this.remotePlayers.get(playerIdStr),
            );
            if (playerIdStr === localIdStr) {
                this._reconcileLocalPlayer(pState);
                continue;
            }
            if (!this.remotePlayers.has(playerIdStr)) {
                this._spawnRemotePlayer(playerIdStr, pState);
            } else {
                const rp = this.remotePlayers.get(playerIdStr);
                if (rp) {
                    if (pState.attacking || pState.isAttacking) {
                        console.log(
                            "!!! EL SOCKET RECIBIÓ ATAQUE PARA:",
                            playerIdStr,
                            pState,
                        );
                    }
                    rp.applyServerState(pState);
                }
            }
        }
        this.remotePlayers.forEach((rp, pid) => {
            if (!state.players[pid]) {
                if (rp.destroy) rp.destroy();
                this.remotePlayers.delete(pid);
            }
        });
        if (state.enemy) this._applyEnemyState(state.enemy);
        if (state.phase === "WIN") this._onCombatEnd("player");
        if (state.phase === "LOSE") this._onCombatEnd("enemy");
    }

    _reconcileLocalPlayer(serverState) {
        if (!this.localPlayer) return;

        if (this._lastDamageDealt !== undefined) {
            const newDamage =
                (serverState.damageDealt ?? 0) - this._lastDamageDealt;
            if (newDamage > 0 && this.time.now > this._ultimateLockUntil)
                this.localPlayer._gainEnergy(newDamage * 2);
        }
        this._lastDamageDealt = serverState.damageDealt ?? 0;

        const translatedY = this._toClientY(serverState.y);

        if (serverState.jumping || serverState.falling) {
            this.localPlayer.y = translatedY;
            this.localPlayer.x = serverState.x;
        } else {
            this.localPlayer.x = Phaser.Math.Linear(
                this.localPlayer.x,
                serverState.x,
                0.2,
            );
            this.localPlayer.y = Phaser.Math.Linear(
                this.localPlayer.y,
                translatedY,
                0.2,
            );
        }

        this.localPlayer.isJumping = serverState.jumping;
        this.localPlayer.isFalling = serverState.falling;

        if (
            serverState.maxHealth !== undefined &&
            this.localPlayer.maxHP !== serverState.maxHealth
        ) {
            this.localPlayer.maxHP = serverState.maxHealth;
        }
        if (
            serverState.health !== undefined &&
            this.localPlayer.hp !== serverState.health
        ) {
            this.localPlayer.hp = serverState.health;
        }
    }

    async _spawnRemotePlayer(playerId, pState) {
        const playerIdStr = String(playerId);
        const textureKey = `player_${playerIdStr}`;
        if (
            this.remotePlayers.has(playerIdStr) ||
            this._loadingPlayers.has(playerIdStr)
        )
            return;
        this._loadingPlayers.add(playerIdStr);
        let characterData = null;
        try {
            characterData = await getPlayerById(parseInt(playerIdStr, 10));
            await this._ensurePlayerTexture(characterData, textureKey);
        } catch (e) {
            console.error(`Error cargando skin para ID ${playerIdStr}:`, e);
            this._createFallbackTexture(textureKey);
        }
        this._loadingPlayers.delete(playerIdStr);
        if (this.remotePlayers.has(playerIdStr)) return;
        const rp = new RemotePlayer(
            this,
            pState.x ?? 500,
            this._toClientY(pState.y ?? 1000),
            textureKey,
            playerIdStr,
        );
        rp.ultimateSkill = String(
            characterData?.ultimateSkill ??
                characterData?.ultimate_skill ??
                "FRIDAY_DEPLOY",
        ).toUpperCase();
        rp.on("ultimateCast", (skill) => {
            this._playUltimateEffect(rp, skill);
            this._onUltimateConfirmed(rp, skill);
        });
        this.remotePlayers.set(playerIdStr, rp);
        this.physics.add.collider(rp, this.platforms);
    }

    _createFallbackTexture(key) {
        if (this.textures.exists(key)) return;
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x00ffc8, 1);
        g.fillRect(0, 0, 32, 48);
        g.generateTexture(key, 32, 48);
        g.destroy();
    }

    _applyEnemyState(enemyState) {
        console.log(
            "Server enemy state:",
            enemyState.health,
            "Local enemy.hp:",
            this.enemy?.hp,
        );
        if (!this.enemy || !this.enemy.active) {
            if (enemyState.alive) this._spawnEnemy();
            return;
        }
        if (
            enemyState.maxHealth !== undefined &&
            this.enemy.maxHP !== enemyState.maxHealth
        ) {
            this.enemy.maxHP = enemyState.maxHealth;
        }
        const translatedY = this._toClientY(enemyState.y);
        this.enemy.x = Phaser.Math.Linear(this.enemy.x, enemyState.x, 0.3);
        this.enemy.y = Phaser.Math.Linear(this.enemy.y, translatedY, 0.3);
        this.enemy.setFlipX(!enemyState.facingRight);
        if (
            enemyState.health !== undefined &&
            Math.abs(this.enemy.hp - enemyState.health) > 0.5
        ) {
            this.enemy.hp = enemyState.health;
            this._updateUI();
        }
        if (!enemyState.alive && this.enemy.active) {
            this.enemy.die();
        }
    }

    update(_time, delta) {
        if (this.combatFinished || !this.localPlayer) return;
        this._updateLocalPlayerVisuals();
        this.remotePlayers.forEach((rp) => {
            if (rp && typeof rp.update === "function" && rp.active)
                rp.update(delta);
        });
        this._captureAndSendInput();
    }

    _updateLocalPlayerVisuals() {
        const p = this.localPlayer;
        const animKey = p.state.toLowerCase();
        p._playAnimation(animKey);
    }

    _captureAndSendInput() {
        if (!this.localPlayer) return;
        const ultimateCount = serverState.ultimateCount ?? 0;
        if (
            this._lastUltimateCount !== undefined &&
            ultimateCount > this._lastUltimateCount
        ) {
            this._onUltimateConfirmed(
                this.localPlayer,
                this.localPlayer.selectedUltimate,
            );
        }
        this._lastUltimateCount = ultimateCount;
        const p = this.localPlayer;
        const { cursors, keys } = p;

        let action = "IDLE";
        if (cursors.left.isDown) {
            action = "MOVE_LEFT";
            p.facingRight = false;
            p.setFlipX(true);
        } else if (cursors.right.isDown) {
            action = "MOVE_RIGHT";
            p.facingRight = true;
            p.setFlipX(false);
        }
        if (
            (cursors.up.isDown || cursors.space?.isDown) &&
            !(p.isJumping || p.isFalling)
        ) {
            action = "JUMP";
            p.y -= 5;
            p.isJumping = true;
        }
        if (
            Phaser.Input.Keyboard.JustDown(keys.attack) &&
            !p.isAttackCooldown
        ) {
            action = "ATTACK";
            p.handleMeleeAttack();
        }
        if (
            Phaser.Input.Keyboard.JustDown(keys.ranged) &&
            !p.isRangedCooldown
        ) {
            action = "RANGED";
            p.handleRangedAttack();
        }
        if (
            Phaser.Input.Keyboard.JustDown(keys.ultimate) &&
            p.energy >= p.ultimateCost &&
            !p.isUsingUltimate
        ) {
            action = "ULTIMATE";
            p.useUltimate();
            this._playUltimateEffect(p, p.selectedUltimate);
            this._ultimateLockUntil = this.time.now + 6000;
        }
        this._sendInput(action);
    }

    _playUltimateEffect(caster, skill) {
    if (caster === this.localPlayer) return;
    const effects = {
        FRIDAY_DEPLOY: Player.prototype._executeFridayDeploy,
        SPAGHETTI_CODE: Player.prototype._executeSpaghettiRain,
        GIT_CLONE: Player.prototype._executeGitClone,
    };
    effects[skill]?.call(caster);
}
/*
    _showHealEffect(sprite) {
        const amount = this.registry.get("ultimateConfig")?.healAmount || 30;
        this.time.delayedCall(600, () => {
            if (!sprite.active) return;
            const text = this.add
                .text(sprite.x, sprite.y - 80, `+${amount} HP`, {
                    fontFamily: "Orbitron",
                    fontSize: "24px",
                    fill: "#00ff41",
                    stroke: "#000000",
                    strokeThickness: 5,
                })
                .setOrigin(0.5)
                .setDepth(3000);
            this.tweens.add({
                targets: text,
                y: text.y - 60,
                alpha: 0,
                duration: 1200,
                ease: "Power2.out",
                onComplete: () => text.destroy(),
            });
            sprite.setTint(0x00ff41);
            this.time.delayedCall(
                500,
                () => sprite.active && sprite.clearTint(),
            );
        });
    }*/

        getUltimateOutcome(caster) {
    const id =
        caster === this.localPlayer ? this.localPlayerId : caster?.playerId;
    return this.ultimateOutcomes?.[String(id)] ?? null;
}

_onUltimateConfirmed(caster, skill) {
    const failed =
        skill === "FRIDAY_DEPLOY" &&
        this.getUltimateOutcome(caster) === "DEPLOY_FAIL";
    if (failed && caster.active) {
        this._floatText(caster, "¡DEPLOY FALLIDO!", "#ff3355");
    }
}

// Números flotantes según la vida real que dice el servidor (cura o daño)
_trackHealth(playerId, health, sprite) {
    const previous = this._lastHealth.get(playerId);
    this._lastHealth.set(playerId, health);
    if (previous === undefined || health === previous || !sprite?.active)
        return;
    const gained = health > previous;
    this._floatText(
        sprite,
        `${gained ? "+" : "-"}${Math.abs(health - previous)}`,
        gained ? "#00ff41" : "#ff3355",
        Phaser.Math.Between(-15, 15),
    );
    sprite.setTint(gained ? 0x00ff41 : 0xff3355);
    this.time.delayedCall(300, () => sprite.active && sprite.clearTint());
}

_floatText(sprite, text, color, offsetX = 0) {
    const label = this.add
        .text(sprite.x + offsetX, sprite.y - 80, text, {
            fontFamily: "Orbitron",
            fontSize: "22px",
            fill: color,
            stroke: "#000000",
            strokeThickness: 5,
        })
        .setOrigin(0.5)
        .setDepth(3000);
    this.tweens.add({
        targets: label,
        y: label.y - 60,
        alpha: 0,
        duration: 1200,
        ease: "Power2.out",
        onComplete: () => label.destroy(),
    });
}

    _spawnEnemy() {
        const { width, height } = this.scale;
        if (this.enemy) {
            this.enemy.removeAllListeners();
            this.enemy.destroy();
        }
        const spawnY = this._toClientY(300);
        this.enemy = new Enemy(this, width - 200, spawnY, "JAVASCRIPT");
        this.physics.add.collider(this.enemy, this.platforms);
        if (this.enemy.body) {
            this.enemy.body.setGravityY(1000);
            this.enemy.body.setCollideWorldBounds(true);
        }
        this.enemy.on("healthChanged", () => this._updateUI());
        this._updateUI();
    }

    _updateUI() {
        if (!this.localPlayer) return;
        EventBus.emit("player-health", {
            hp: this.localPlayer.hp,
            maxHP: this.localPlayer.maxHP,
        });
        if (this.enemy) {
            EventBus.emit("enemy-health", {
                hp: this.enemy.hp,
                maxHP: this.enemy.maxHP,
                type: this.enemy.enemyType,
            });
        }
    }

    _onLocalPlayerDied() {
        // El servidor decide el fin de partida via phase === "LOSE"
    }

    _onCombatEnd(winner) {
        if (this.combatFinished) return;
        this.combatFinished = true;
        this.physics.pause();
        EventBus.emit("combat-result", { winner });
    }

    _cleanup() {
        disconnectFromRoom();
        if (this.stompClient) {
            this.stompClient.deactivate();
            this.stompClient = null;
        }
        this.remotePlayers.forEach((rp) => {
            if (rp && typeof rp.destroy === "function") rp.destroy();
        });
        this.remotePlayers.clear();
        if (this._loadingPlayers) this._loadingPlayers.clear();
        EventBus.off("player-ultimate-executed");
        EventBus.off("enemy-ultimate-executed");
    }

    async _ensurePlayerTexture(serverData, textureKey) {
        if (!serverData || !textureKey) return;
        if (this.textures.exists(textureKey)) return;
        return new Promise((resolve) => {
            const frames = generateCharacterFrames(serverData, "idle");
            const svgString = frames[0];
            const img = new Image();
            const blob = new Blob([svgString], {
                type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            img.onload = () => {
                this.textures.addImage(textureKey, img);
                URL.revokeObjectURL(url);
                resolve();
            };
            img.onerror = () => {
                console.error(
                    "Error cargando el SVG para la textura:",
                    textureKey,
                );
                URL.revokeObjectURL(url);
                resolve();
            };
            img.src = url;
        });
    }

    _createSceneTextures() {
        if (!this.textures.exists("platform_tile")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x0a0a1a, 1);
            g.fillRect(0, 0, 8, 16);
            g.fillStyle(0x00ffc8, 0.9);
            g.fillRect(0, 0, 8, 2);
            g.generateTexture("platform_tile", 8, 16);
            g.destroy();
        }
        if (!this.textures.exists("spaghetti")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.lineStyle(2, 0xf7df1e, 1);
            g.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, 20));
            g.generateTexture("spaghetti", 2, 20);
            g.destroy();
        }
        if (!this.textures.exists("confetti")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xffffff, 1);
            g.fillRect(0, 0, 8, 8);
            g.generateTexture("confetti", 8, 8);
            g.destroy();
        }
        if (!this.textures.exists("spaghetti_code")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xf7df1e, 1);
            g.fillRect(0, 0, 3, 24);
            g.generateTexture("spaghetti_code", 3, 24);
            g.destroy();
        }
        if (!this.textures.exists("projectile-duck")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xf7df1e, 1);
            g.fillEllipse(16, 20, 24, 18);
            g.fillEllipse(22, 12, 16, 14);
            g.fillStyle(0xff8c00, 1);
            g.fillTriangle(28, 10, 34, 10, 34, 14);
            g.generateTexture("projectile-duck", 36, 32);
            g.destroy();
        }
        if (!this.textures.exists("projectile-bug")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x22c55e, 1);
            g.fillEllipse(16, 18, 16, 20);
            g.generateTexture("projectile-bug", 32, 32);
            g.destroy();
        }
        if (!this.textures.exists("player_fallback")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xff00ff, 1);
            g.fillRect(0, 0, 32, 32);
            g.generateTexture("player_fallback", 32, 32);
            g.destroy();
        }
    }

    _createBackground(width, height) {
        this.add
            .rectangle(width / 2, height / 2, width, height, 0x020408)
            .setDepth(-10);
        const gridGfx = this.add.graphics().setDepth(-8);
        const groundY = height - 60;
        const horizon = height * 0.55;
        for (let i = 0; i <= 8; i++) {
            const t = i / 8;
            const y = horizon + (groundY - horizon) * t;
            gridGfx.lineStyle(1, 0x00ffc8, 0.05 + t * 0.2);
            gridGfx.beginPath();
            gridGfx.moveTo(0, y);
            gridGfx.lineTo(width, y);
            gridGfx.strokePath();
        }
        const scanGfx = this.add.graphics().setDepth(100).setAlpha(0.04);
        for (let y = 0; y < height; y += 4) {
            scanGfx.fillStyle(0x000000, 1);
            scanGfx.fillRect(0, y + 2, width, 2);
        }
    }

    _createPlatforms(width, height) {
        const platforms = this.physics.add.staticGroup();
        const groundY = height - 30;
        const floorBody = this.add.rectangle(
            width / 2,
            groundY + 35,
            width,
            60,
            0x000000,
            0,
        );
        this.physics.add.existing(floorBody, true);
        platforms.add(floorBody);
        const floorGfx = this.add.graphics().setDepth(1);
        floorGfx.fillStyle(0x020408, 1);
        floorGfx.fillRect(0, groundY, width, 60);
        floorGfx.lineStyle(2, 0x00ffc8, 1);
        floorGfx.beginPath();
        floorGfx.moveTo(0, groundY);
        floorGfx.lineTo(width, groundY);
        floorGfx.strokePath();
        this._addPlatform(platforms, 160, height - 260, 180);
        this._addPlatform(platforms, width / 2, height - 370, 200);
        this._addPlatform(platforms, width - 180, height - 290, 180);
        return platforms;
    }

    _addPlatform(platforms, cx, cy, w) {
        const h = 28;
        const body = this.add.rectangle(cx, cy, w, h, 0x0a0d14);
        this.physics.add.existing(body, true);
        platforms.add(body);
        const gfx = this.add.graphics().setDepth(2);
        gfx.lineStyle(1.5, 0x00ffc8, 0.9);
        gfx.strokeRect(cx - w / 2, cy - h / 2, w, h);
    }

    _toClientY(serverY) {
        const floorY = this.scale.height - 30;
        return (serverY / 1000) * floorY;
    }

    _toServerY(clientY) {
        const floorY = this.scale.height - 30;
        return (clientY / floorY) * 1000;
    }
}
