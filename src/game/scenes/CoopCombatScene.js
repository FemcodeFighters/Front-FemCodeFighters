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

            await this._ensurePlayerTexture(serverData, "player_custom");
            this.localPlayer = new Player(this, 200, height - 90);
            this.localPlayer.body.setAllowGravity(false);
            this.localPlayer.body.setImmovable(true);
            this.physics.add.collider(this.localPlayer, this.platforms);
            this.registry.set("character", serverData);
            this.registry.set("ultimateConfig", ultimateConfig);
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
        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws-game"),
            onConnect: () => {
                client.subscribe(`/topic/game/${this.roomId}`, (msg) => {
                    const state = JSON.parse(msg.body);
                    this._applyServerState(state);
                });
            },
            onDisconnect: () =>
                console.warn("CoopCombatScene: WebSocket desconectado"),
        });
        client.activate();
        this.stompClient = client;
    }

    _sendInput(action) {
        if (!this.stompClient?.connected) return;
        const isEvent = ["ATTACK", "ULTIMATE", "RANGED"].includes(action);
        if (isEvent && action === this.lastSentInput) return;
        this.lastSentInput = action;
        this.stompClient.publish({
            destination: `/app/game/${this.roomId}/input`,
            body: JSON.stringify({
                playerId: this.localPlayerId,
                action,
                tick: this.inputTick++,
            }),
        });
    }

    async _applyServerState(state) {
        if (!state?.players) return;

        for (const [pid, pState] of Object.entries(state.players)) {
            if (String(pid) === String(this.localPlayerId)) {
                this._reconcileLocalPlayer(pState);
                continue;
            }
            if (!this.remotePlayers.has(pid)) {
                this._spawnRemotePlayer(pid, pState);
            } else {
                const rp = this.remotePlayers.get(pid);
                if (rp && typeof rp.applyServerState === "function") {
                    rp.applyServerState(pState);
                }
            }
        }

        this.remotePlayers.forEach((rp, pid) => {
            if (!state.players[pid]) {
                if (rp && typeof rp.destroy === "function") rp.destroy();
                this.remotePlayers.delete(pid);
            }
        });

        if (state.enemy) this._applyEnemyState(state.enemy);
        if (state.phase === "WIN") this._onCombatEnd("player");
        if (state.phase === "LOSE") this._onCombatEnd("enemy");
    }

    _reconcileLocalPlayer(serverState) {
        if (!this.localPlayer) return;

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
            serverState.health !== undefined &&
            serverState.health < this.localPlayer.hp
        ) {
            this.localPlayer.hp = serverState.health;
            this._updateUI();
        }
    }

    async _spawnRemotePlayer(playerId, pState) {
        const textureKey = `player_${playerId}`;

        if (
            this.remotePlayers.has(playerId) ||
            this._loadingPlayers.has(playerId)
        )
            return;
        this._loadingPlayers.add(playerId);

        try {
            const idNumerico = parseInt(playerId, 10);
            const characterData = await getPlayerById(idNumerico);
            await this._ensurePlayerTexture(characterData, textureKey);
        } catch (e) {
            console.error(`Error cargando skin para ID ${playerId}:`, e);
            this._createFallbackTexture(textureKey);
        }

        this._loadingPlayers.delete(playerId);

        if (this.remotePlayers.has(playerId)) return;

        const rp = new RemotePlayer(
            this,
            pState.x ?? 500,
            this._toClientY(pState.y ?? 1000),
            textureKey,
            playerId,
        );
        this.remotePlayers.set(playerId, rp);
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
        if (!this.enemy || !this.enemy.active) {
            if (enemyState.alive) this._spawnEnemy();
            return;
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

        this.localPlayer.update(delta);

        this.remotePlayers.forEach((rp) => {
            if (rp && typeof rp.update === "function" && rp.active) {
                rp.update(delta);
            }
        });

        this._captureAndSendInput();
    }

    _captureAndSendInput() {
        if (!this.localPlayer) return;

        const cursors = this.localPlayer.cursors;
        const keys = this.localPlayer.keys;
        let action = "IDLE";

        if (cursors.left.isDown) action = "MOVE_LEFT";
        else if (cursors.right.isDown) action = "MOVE_RIGHT";

        const isJumpingOrFalling =
            this.localPlayer.isJumping || this.localPlayer.isFalling;

        if (
            (cursors.up.isDown || cursors.space?.isDown) &&
            !isJumpingOrFalling
        ) {
            action = "JUMP";
            this.localPlayer.y -= 5;
            this.localPlayer.isJumping = true;
        }

        if (Phaser.Input.Keyboard.JustDown(keys.attack)) action = "ATTACK";
        if (Phaser.Input.Keyboard.JustDown(keys.ranged)) action = "RANGED";
        if (Phaser.Input.Keyboard.JustDown(keys.ultimate)) action = "ULTIMATE";

        this._sendInput(action);
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
