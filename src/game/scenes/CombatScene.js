import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import Player from "../characters/Player";
import Enemy from "../characters/Enemy";
import { getCharacter, getUltimateConfig } from "../../service/playerApi";
import { generateCharacterFrames } from "../../components/molecules/characterSVG";
import { loadEnemyTextures } from "../../components/molecules/enemySVG";

export default class CombatScene extends Scene {
    constructor() {
        super({
            key: "CombatScene",
            physics: {
                arcade: {
                    gravity: { y: 800 },
                    debug: false,
                    fps: 60,
                    overlapBias: 8,
                },
            },
        });
    }

    init() {
        this.combatFinished = false;
        this.currentEnemyIndex = 0;
        this.player = null;
        this.enemy = null;
        this.spaghettiRain = null;
        this.enemyQueue = [
            "HTML",
            "CSS",
            "JAVASCRIPT",
            "REACT",
            "JAVA",
            "SPRINGBOOT",
        ];
    }

    async create() {
        const { width, height } = this.scale;
        if (this.input?.keyboard) {
            this.input.keyboard.enabled = true;
        }
        this.cameras.main.setBackgroundColor("#020408").fadeIn(500);
        this._createSceneTextures();
        this._createBackground(width, height);
        this.platforms = this._createPlatforms(width, height);
        this._createMatrixRain(width, height);
        this._createSpaghettiRain();
        await loadEnemyTextures(this);
        EventBus.off("player-ultimate-executed");
        EventBus.on("player-ultimate-executed", (data) => {
            if (!this.player) return;
            let ultName = "¡SYSTEM OVERRIDE!";
            let ultColor = "#7c3aed";
            const type = data?.type?.toUpperCase() || "";
            switch (type) {
                case "GIT_CLONE":
                    ultName = "¡GIT CLONE REPOSITORY!";
                    ultColor = "#ff0055";
                    break;
                case "SPAGHETTI_CODE":
                    ultName = "¡SPAGHETTI CODE STORM!";
                    ultColor = "#f59e0b";
                    if (this.spaghettiRain) {
                        this.spaghettiRain.setFrequency(50, 20);
                    }
                    break;
                case "FRIDAY_DEPLOY":
                    ultName = "¡FRIDAY DEPLOY!";
                    ultColor = "#00ff41";
                    break;
            }
            this.showCombatText(
                this.player.x,
                this.player.y - 50,
                ultName,
                ultColor,
                true,
            );
            this.cameras.main.flash(500, 255, 255, 255);
            this.cameras.main.shake(500, 0.02);
            this.time.delayedCall(5000, () => {
                if (this.spaghettiRain) {
                    this.spaghettiRain.setFrequency(-1);
                }
            });
        });
        EventBus.off("enemy-ultimate-executed");
        EventBus.on("enemy-ultimate-executed", (data) => {
            if (!this.enemy) return;
            let ultName = "¡DEBUG_MODE_OVERRIDE!";
            let ultColor = "#ff4444";
            const type = data?.type?.toUpperCase() || "";
            switch (type) {
                case "JAVASCRIPT":
                    ultName = "¡CALLBACK HELL! 🔥";
                    ultColor = "#f7df1e";
                    break;
                case "JAVA":
                    ultName = "¡OUT OF MEMORY! 💀";
                    ultColor = "#ed8b00";
                    break;
                case "CSS":
                    ultName = "¡Z-INDEX CONFUSION! 🌀";
                    ultColor = "#264de4";
                    break;
                case "SPRINGBOOT":
                    ultName = "¡BEAN EXCEPTION! 💣";
                    ultColor = "#6db33f";
                    break;
            }
            this.showCombatText(
                this.enemy.x,
                this.enemy.y - 50,
                ultName,
                ultColor,
                true,
            );
            this.cameras.main.flash(300, 255, 0, 0);
            this.cameras.main.shake(400, 0.01);
        });
        await this._initEntities(width, height);
        EventBus.emit("current-scene-ready", this);
        this.events.once("shutdown", () => this._cleanup());
    }

    async _initEntities(width, height) {
    try {
        const [serverData, ultimateConfig] = await Promise.all([
            getCharacter(),
            getUltimateConfig(),
        ]);
        this.registry.set("character", serverData);
        this.registry.set("ultimateConfig", ultimateConfig);
        EventBus.emit("player-name", { name: serverData.username || "PLAYER" });
        await this._ensurePlayerTexture(serverData);
        this.player = new Player(this, 200, height - 90);
    } catch (error) {
        console.error("Error cargando personaje:", error);
        EventBus.emit("combat-load-error", {
            message: "No se puede conectar con el servidor. Inténtalo de nuevo.",
        });
        return;
    }
    this.physics.add.collider(this.player, this.platforms);
    this.player.on("healthChanged", () => this._updateUI());
    this.player.on("died", () => this._onCombatEnd("enemy"));
    this.spawnNextEnemy();
}

    spawnNextEnemy() {
        const { width, height } = this.scale;
        if (this.currentEnemyIndex >= this.enemyQueue.length) {
            this._onCombatEnd("player");
            return;
        }
        const type = this.enemyQueue[this.currentEnemyIndex];
        this._actualSpawn(width, height, type);
    }

    _actualSpawn(width, height, type) {
        if (this.enemy) {
            this.enemy.removeAllListeners();
            this.enemy.destroy();
            this.enemy = null;
        }

        this.showNextStackAnnouncement(type);

        const groundY = height - 150;
        this.enemy = new Enemy(this, width - 200, groundY, type);
        this.physics.add.collider(this.enemy, this.platforms);
        if (this.enemy.body) {
            this.enemy.body.setGravityY(1000);
            this.enemy.body.setCollideWorldBounds(true);
        }
        this.enemy.once("died", () => {
            if (this.combatFinished) return;
            if (this.player && this.player.isAlive()) {
                const healAmount = 30;
                this.player.hp = Math.min(
                    this.player.maxHP,
                    this.player.hp + healAmount,
                );
                this.showCombatText(
                    this.player.x,
                    this.player.y,
                    `+${healAmount} HP (REFACTORIZED!)`,
                    "#00ff00",
                );
                this.player.setTint(0x00ff00);
                this.time.delayedCall(300, () => this.player.clearTint());
                this._updateUI();
            }
            this.enemy = null;
            if (this.currentEnemyIndex >= this.enemyQueue.length - 1) {
                this._finalBossEffect();
            } else {
                this.currentEnemyIndex++;
                this.time.delayedCall(1500, () => {
                    if (!this.combatFinished) this.spawnNextEnemy();
                });
            }
        });
        this.enemy.on("healthChanged", () => {
            if (this.enemy) this._updateUI();
        });
        this._updateUI();
    }

    update(_time, delta) {
        if (!this.player || this.combatFinished) return;

        this.player.update(delta);

        if (this.enemy && this.enemy.active && this.enemy.visible) {
            this.enemy.update(delta, this.player);
            this._checkCombatCollisions();
        }
    }

    _updateUI() {
    if (!this.player) return;
    EventBus.emit("player-health", {
        hp: this.player.hp,
        maxHP: this.player.maxHP,
    });
    if (this.enemy) {
        EventBus.emit("enemy-health", {
            hp: this.enemy.hp,
            maxHP: this.enemy.maxHP,
            type: this.enemy.enemyType,
        });
    }
}

    _checkCombatCollisions() {
        if (
            !this.player ||
            !this.enemy ||
            !this.enemy.active ||
            !this.enemy.body
        )
            return;
        if (!this.player.isAlive() || !this.enemy.isAlive()) return;
        const currentEnemy = this.enemy;
        if (this.player.checkAttackHit(currentEnemy)) {
            this.player.onMeleeHit();
            this.showCombatText(
                currentEnemy.x,
                currentEnemy.y,
                "¡STACKOVERFLOW SMASH!",
                "#f59e0b",
            );
            this._updateUI();
        }
        this.player.checkProjectileHit(currentEnemy, () => {
            if (!currentEnemy || !currentEnemy.active) return;
            this.player.onRangedHit();
            this.showCombatText(
                currentEnemy.x,
                currentEnemy.y,
                "¡RUBBER DUCK DEBUGGING!",
                "#00ccff",
            );
            this._updateUI();
        });

        if (currentEnemy.checkAttackHit(this.player)) {
            currentEnemy.onMeleeHit();
            this.showCombatText(
                this.player.x,
                this.player.y,
                "¡CODE SMELL!",
                "#ff4444",
            );
            this._updateUI();
        }

        currentEnemy.checkProjectileHit(this.player, () => {
            currentEnemy.onRangedHit();
            this.showCombatText(
                this.player.x,
                this.player.y,
                "¡BUG!",
                "#ff0000",
            );
            this._updateUI();
        });
    }

    showCombatText(x, y, message, color = "#ffffff", isUltimate = false) {
        const text = this.add
            .text(x, y - 100, message, {
                fontFamily: "Orbitron",
                fontSize: isUltimate ? "64px" : "24px",
                fill: color,
                stroke: "#000000",
                strokeThickness: isUltimate ? 12 : 6,
            })
            .setOrigin(0.5)
            .setDepth(2000)
            .setAlpha(0);

        this.tweens.add({
            targets: text,
            alpha: 1,
            y: y - 180,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            ease: "Back.out",
            onComplete: () => {
                this.tweens.add({
                    targets: text,
                    alpha: 0,
                    y: y - 250,
                    duration: 1500,
                    delay: 500,
                    onComplete: () => text.destroy(),
                });
            },
        });
    }

    _onCombatEnd(winner) {
        if (this.combatFinished) return;
        this.combatFinished = true;
        this.physics.pause();
        EventBus.emit("combat-result", { winner });
    }

    _cleanup() {
        if (this._matrixTimer) this._matrixTimer.remove();
        this._matrixColumns = null;
        EventBus.off("player-ultimate-executed");
        EventBus.off("enemy-ultimate-executed");
    }

    _createMockupTextures() {
        if (!this.textures.exists("spaghetti")) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.lineStyle(2, 0xf7df1e, 1);
            graphics.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, 20));
            graphics.generateTexture("spaghetti", 2, 20);
        }

        if (!this.textures.exists("confetti")) {
            const graphics = this.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(0, 0, 8, 8);
            graphics.generateTexture("confetti", 8, 8);
        }
    }

    _createSpaghettiRain() {
        this.spaghettiRain = this.add
            .particles(0, 0, "spaghetti", {
                x: { min: 0, max: this.scale.width },
                y: -50,
                lifespan: 2000,
                speedY: { min: 400, max: 700 },
                scaleY: { min: 1, max: 2 },
                alpha: { start: 1, end: 0 },
                gravityY: 300,
                frequency: -1,
                quantity: 0,
            })
            .setDepth(1);
    }

    async _ensurePlayerTexture(serverData) {
        if (!serverData) return;
        if (this.textures.exists("player_custom")) {
            this.textures.remove("player_custom");
        }
        return new Promise((resolve) => {
            const frames = generateCharacterFrames(serverData, "idle");
            const blob = new Blob([frames[0]], {
                type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            this.load.image("player_custom", url);
            this.load.once("complete", resolve);
            this.load.start();
        });
    }

    _finalBossEffect() {
        const { width, height } = this.scale;
        this.showCombatText(
            width / 2,
            height / 2,
            "¡FULL STACK MASTERED!",
            "#00ff41",
            true,
        );
        const leftConfetti = this.add.particles(0, height, "confetti", {
            angle: { min: -60, max: -20 },
            speed: { min: 400, max: 800 },
            gravityY: 400,
            lifespan: 3000,
            tint: [0x00ff41, 0x00ccff, 0xf59e0b, 0xff0055],
            scale: { start: 1, end: 0 },
            quantity: 5,
            rotate: { min: 0, max: 360 },
        });

        const rightConfetti = this.add.particles(width, height, "confetti", {
            angle: { min: 200, max: 240 },
            speed: { min: 400, max: 800 },
            gravityY: 400,
            lifespan: 3000,
            tint: [0x00ff41, 0x00ccff, 0xf59e0b, 0xff0055],
            scale: { start: 1, end: 0 },
            quantity: 5,
            rotate: { min: 0, max: 360 },
        });
        this.cameras.main.flash(500, 255, 255, 255);
        this.cameras.main.shake(1000, 0.01);
        this.time.delayedCall(4000, () => {
            leftConfetti.stop();
            rightConfetti.stop();
            this._onCombatEnd("player");
        });
    }

    showNextStackAnnouncement(type) {
        const { width, height } = this.scale;
        const overlay = this.add
            .rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
            .setDepth(1999)
            .setAlpha(0);
        const label = this.add
            .text(width / 2, height / 2 - 60, "NEXT STACK", {
                fontFamily: "Orbitron",
                fontSize: "32px",
                fill: "#888888",
                stroke: "#000000",
                strokeThickness: 6,
                letterSpacing: 12,
            })
            .setOrigin(0.5)
            .setDepth(2000)
            .setAlpha(0)
            .setScale(0.5);
        const colors = {
            HTML: "#e34c26",
            CSS: "#264de4",
            JAVASCRIPT: "#f7df1e",
            REACT: "#00d8ff",
            JAVA: "#ed8b00",
            SPRINGBOOT: "#6db33f",
        };
        const color = colors[type] || "#00ccff";
        const nameText = this.add
            .text(width / 2, height / 2 + 20, type, {
                fontFamily: "Orbitron",
                fontSize: "96px",
                fill: color,
                stroke: "#000000",
                strokeThickness: 14,
            })
            .setOrigin(0.5)
            .setDepth(2000)
            .setAlpha(0)
            .setScale(0.3);
        this.tweens.add({
            targets: overlay,
            alpha: 1,
            duration: 300,
            ease: "Power2",
        });
        this.tweens.add({
            targets: label,
            alpha: 1,
            scale: 1,
            duration: 400,
            ease: "Back.out",
            delay: 100,
        });
        this.tweens.add({
            targets: nameText,
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: "Back.out",
            delay: 250,
            onComplete: () => {
                this.cameras.main.shake(400, 0.015);
                const hex = parseInt(color.replace("#", ""), 16);
                const r = (hex >> 16) & 255;
                const g = (hex >> 8) & 255;
                const b = hex & 255;
                this.cameras.main.flash(300, r, g, b, false);
            },
        });
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: [overlay, label, nameText],
                alpha: 0,
                scale: 1.2,
                duration: 400,
                ease: "Power2.in",
                onComplete: () => {
                    overlay.destroy();
                    label.destroy();
                    nameText.destroy();
                },
            });
        });
    }

    _createSceneTextures() {
        if (!this.textures.exists("grid_tile")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, 40, 40);
            g.lineStyle(1, 0x00ffc8, 0.25);
            g.strokeRect(0, 0, 40, 40);
            g.fillStyle(0x00ffc8, 0.4);
            g.fillRect(0, 0, 2, 2);
            g.generateTexture("grid_tile", 40, 40);
            g.destroy();
        }

        if (!this.textures.exists("platform_tile")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x0a0a1a, 1);
            g.fillRect(0, 0, 8, 16);
            g.fillStyle(0x00ffc8, 0.9);
            g.fillRect(0, 0, 8, 2);
            g.fillStyle(0x00ffc8, 0.15);
            g.fillRect(0, 2, 8, 4);
            g.fillStyle(0x00ffc8, 0.2);
            g.fillRect(0, 14, 8, 2);
            g.generateTexture("platform_tile", 8, 16);
            g.destroy();
        }

        if (!this.textures.exists("floor_tile")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x050510, 1);
            g.fillRect(0, 0, 8, 24);
            g.fillStyle(0x00ffc8, 1);
            g.fillRect(0, 0, 8, 2);
            g.fillStyle(0x00ffc8, 0.3);
            g.fillRect(0, 2, 8, 3);
            g.generateTexture("floor_tile", 8, 24);
            g.destroy();
        }

        if (!this.textures.exists("matrix_char")) {
            const chars = "01アイウエオカキクケコサシスセソタチツテト";
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x000000, 0);
            g.fillRect(0, 0, 8, 14);
            g.generateTexture("matrix_char", 8, 14);
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

        if (!this.textures.exists("projectile-duck")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xf7df1e, 1);
            g.fillEllipse(16, 20, 24, 18);
            g.fillEllipse(22, 12, 16, 14);
            g.fillStyle(0xe6c800, 1);
            g.fillEllipse(14, 22, 14, 8);
            g.fillStyle(0xff8c00, 1);
            g.fillTriangle(28, 10, 34, 10, 34, 14);
            g.fillStyle(0x0a0a0a, 1);
            g.fillCircle(24, 10, 2);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(25, 9, 0.8);
            g.generateTexture("projectile-duck", 36, 32);
            g.destroy();
        }

        if (!this.textures.exists("projectile-bug")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x22c55e, 1);
            g.fillEllipse(16, 18, 16, 20);
            g.fillStyle(0x16a34a, 1);
            g.fillEllipse(16, 9, 12, 10);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(13, 8, 1.8);
            g.fillCircle(19, 8, 1.8);
            g.fillStyle(0x0a0a0a, 1);
            g.fillCircle(13.5, 8, 1);
            g.fillCircle(19.5, 8, 1);
            g.generateTexture("projectile-bug", 32, 32);
            g.destroy();
        }

        if (!this.textures.exists("spaghetti_code")) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xf7df1e, 1);
            g.fillRect(0, 0, 3, 24);
            g.fillStyle(0xffffff, 0.6);
            g.fillRect(1, 0, 1, 24);
            g.generateTexture("spaghetti_code", 3, 24);
            g.destroy();
        }
    }

    _createBackground(width, height) {
        this.add
            .rectangle(width / 2, height / 2, width, height, 0x020408)
            .setDepth(-10);
        const buildingGfx = this.add.graphics().setDepth(-9).setAlpha(0.6);
        const buildings = [
            { x: 0, w: 80, h: 280 },
            { x: 60, w: 60, h: 200 },
            { x: 110, w: 100, h: 320 },
            { x: 190, w: 50, h: 180 },
            { x: 230, w: 90, h: 260 },
            { x: 310, w: 70, h: 300 },
            { x: 370, w: 110, h: 220 },
            { x: 560, w: 90, h: 290 },
            { x: 640, w: 60, h: 200 },
            { x: 690, w: 100, h: 340 },
            { x: 780, w: 70, h: 260 },
            { x: 840, w: 90, h: 190 },
            { x: 920, w: 60, h: 310 },
            { x: 970, w: 80, h: 240 },
        ];

        buildings.forEach((b) => {
            buildingGfx.fillStyle(0x06080f, 1);
            buildingGfx.fillRect(b.x, height - 60 - b.h, b.w, b.h);
            buildingGfx.fillStyle(0x00ffc8, 0.12);
            for (let wy = height - 60 - b.h + 10; wy < height - 70; wy += 18) {
                for (let wx = b.x + 6; wx < b.x + b.w - 6; wx += 14) {
                    if ((wx + wy) % 3 !== 0) {
                        buildingGfx.fillRect(wx, wy, 6, 8);
                    }
                }
            }
            buildingGfx.fillStyle(0x00ffc8, 0.15);
            buildingGfx.fillRect(b.x, height - 60 - b.h, b.w, 1);
        });

        const gridGfx = this.add.graphics().setDepth(-8);
        const groundY = height - 60;
        const horizon = height * 0.55;

        for (let i = 0; i <= 8; i++) {
            const t = i / 8;
            const y = horizon + (groundY - horizon) * t;
            const alpha = 0.05 + t * 0.2;
            gridGfx.lineStyle(1, 0x00ffc8, alpha);
            gridGfx.beginPath();
            gridGfx.moveTo(0, y);
            gridGfx.lineTo(width, y);
            gridGfx.strokePath();
        }

        const vLines = 16;
        for (let i = 0; i <= vLines; i++) {
            const t = i / vLines;
            const xGround = width * t;
            const xHorizon = width / 2 + (xGround - width / 2) * 0.1;
            const alpha = 0.06 + Math.abs(t - 0.5) * 0.1;
            gridGfx.lineStyle(1, 0x00ffc8, alpha);
            gridGfx.beginPath();
            gridGfx.moveTo(xHorizon, horizon);
            gridGfx.lineTo(xGround, groundY);
            gridGfx.strokePath();
        }

        const scanGfx = this.add.graphics().setDepth(100).setAlpha(0.04);
        for (let y = 0; y < height; y += 4) {
            scanGfx.fillStyle(0x000000, 1);
            scanGfx.fillRect(0, y + 2, width, 2);
        }

        const horizonGfx = this.add.graphics().setDepth(-7);
        horizonGfx.lineStyle(1, 0x00ffc8, 0.3);
        horizonGfx.beginPath();
        horizonGfx.moveTo(0, horizon);
        horizonGfx.lineTo(width, horizon);
        horizonGfx.strokePath();
        horizonGfx.lineStyle(3, 0x00ffc8, 0.05);
        horizonGfx.beginPath();
        horizonGfx.moveTo(0, horizon);
        horizonGfx.lineTo(width, horizon);
        horizonGfx.strokePath();
    }

    _createPlatforms(width, height) {
        const platforms = this.physics.add.staticGroup();
        const groundY = height - 30;
        const floorBody = this.add.rectangle(
            width / 2,
            groundY,
            width,
            60,
            0x000000,
            0,
        );
        this.physics.add.existing(floorBody, true);
        platforms.add(floorBody);
        const floorGfx = this.add.graphics().setDepth(1);
        floorGfx.fillStyle(0x020408, 1);
        floorGfx.fillRect(0, groundY - 28, width, 58);
        floorGfx.lineStyle(2, 0x00ffc8, 1);
        floorGfx.beginPath();
        floorGfx.moveTo(0, groundY - 28);
        floorGfx.lineTo(width, groundY - 28);
        floorGfx.strokePath();
        floorGfx.lineStyle(6, 0x00ffc8, 0.08);
        floorGfx.beginPath();
        floorGfx.moveTo(0, groundY - 25);
        floorGfx.lineTo(width, groundY - 25);
        floorGfx.strokePath();
        for (let x = 0; x < width; x += 40) {
            floorGfx.lineStyle(1, 0x00ffc8, 0.12);
            floorGfx.beginPath();
            floorGfx.moveTo(x, groundY - 28);
            floorGfx.lineTo(x, groundY + 30);
            floorGfx.strokePath();
        }

        this._buildPlatform(platforms, 160, height - 260, 180, 28);
        this._buildPlatform(platforms, width / 2, height - 370, 200, 28);
        this._buildPlatform(platforms, width - 180, height - 290, 180, 28);

        return platforms;
    }

    _buildPlatform(platforms, cx, cy, w, h) {
        const body = this.add.rectangle(cx, cy, w, h, 0x000000, 0);
        this.physics.add.existing(body, true);
        platforms.add(body);

        const gfx = this.add.graphics().setDepth(2);
        const x = cx - w / 2;
        const y = cy - h / 2;
        gfx.fillStyle(0x0a0d14, 1);
        gfx.fillRect(x, y, w, h);
        gfx.lineStyle(1.5, 0x00ffc8, 0.9);
        gfx.beginPath();
        gfx.moveTo(x + 5, y);
        gfx.lineTo(x + w - 5, y);
        gfx.lineTo(x + w, y + 4);
        gfx.lineTo(x + w, y + h - 4);
        gfx.lineTo(x + w - 5, y + h);
        gfx.lineTo(x + 5, y + h);
        gfx.lineTo(x, y + h - 4);
        gfx.lineTo(x, y + 4);
        gfx.closePath();
        gfx.strokePath();

        const keySize = 7;
        const keyGap = 2;
        const padX = 6;
        const padY = 4;
        const cols = Math.floor((w - padX * 2) / (keySize + keyGap));
        const rows = Math.floor((h - padY * 2) / (keySize + keyGap));
        const keyColors = [
            { fill: 0x141a24, stroke: 0x00ffc8, alpha: 0.9 },
            { fill: 0x141a24, stroke: 0x7c3aed, alpha: 0.8 },
            { fill: 0x141a24, stroke: 0x00ffc8, alpha: 0.6 },
        ];
        const litKeys = [
            { fill: 0x00ffc8, stroke: 0x00ffc8, alpha: 1 },
            { fill: 0x7c3aed, stroke: 0xb388ff, alpha: 1 },
            { fill: 0xf7df1e, stroke: 0xf7df1e, alpha: 1 },
        ];

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const kx = x + padX + col * (keySize + keyGap);
                const ky = y + padY + row * (keySize + keyGap);
                const seed = (col * 7 + row * 13) % 100;
                let style;
                if (seed < 6) {
                    style = litKeys[seed % litKeys.length];
                } else {
                    style = keyColors[(col + row) % keyColors.length];
                }
                gfx.fillStyle(0x000000, 0.5);
                gfx.fillRect(kx + 1, ky + 1, keySize, keySize);
                gfx.fillStyle(style.fill, style.alpha);
                gfx.fillRect(kx, ky, keySize, keySize);
                gfx.lineStyle(0.5, style.stroke, style.alpha);
                gfx.strokeRect(kx, ky, keySize, keySize);
                if (seed < 6) {
                    gfx.fillStyle(style.fill, 0.3);
                    gfx.fillRect(kx + 1, ky + 1, keySize - 2, 3);
                }
            }
        }
        gfx.lineStyle(10, 0x00ffc8, 0.03);
        gfx.beginPath();
        gfx.moveTo(x + 10, y + h + 5);
        gfx.lineTo(x + w - 10, y + h + 5);
        gfx.strokePath();
        gfx.lineStyle(18, 0x00ffc8, 0.015);
        gfx.beginPath();
        gfx.moveTo(x + 20, y + h + 9);
        gfx.lineTo(x + w - 20, y + h + 9);
        gfx.strokePath();
        const brand = ["CYBER-KB v2", "MECH-PRO X", "CODE-DECK"][
            Math.floor((cx * 7) % 3)
        ];
        this.add
            .text(cx, y + h - 2, brand, {
                fontFamily: "monospace",
                fontSize: "5px",
                color: "#00ffc8",
                alpha: 0.3,
            })
            .setOrigin(0.5, 1)
            .setDepth(3)
            .setAlpha(0.25);
    }
    _createMatrixRain(width, height) {
        const COLS = 28;
        const CHAR_H = 18;
        const CHARS =
            "01アイウエカキクサシスタチツテナニヌネハヒフヘマミムメラリルレワヲン{}[]()<>/\\|;:@#$%&";
        const colWidth = width / COLS;
        this._matrixColumns = [];
        for (let col = 0; col < COLS; col++) {
            const x = col * colWidth + colWidth / 2;
            const speed = Phaser.Math.Between(40, 120);
            const length = Phaser.Math.Between(6, 18);
            const startY = Phaser.Math.Between(-height, 0);
            const column = {
                x,
                y: startY,
                speed,
                length,
                chars: [],
            };
            for (let i = 0; i < length; i++) {
                const alpha = i === length - 1 ? 1 : (i / length) * 0.5;
                const color = i === length - 1 ? "#ffffff" : "#00ffc8";
                const t = this.add
                    .text(
                        x,
                        startY + i * CHAR_H,
                        CHARS[Phaser.Math.Between(0, CHARS.length - 1)],
                        {
                            fontFamily: "monospace",
                            fontSize: "14px",
                            color,
                        },
                    )
                    .setOrigin(0.5, 0)
                    .setAlpha(alpha * 0.35)
                    .setDepth(-5);
                column.chars.push(t);
            }
            this._matrixColumns.push(column);
        }
        this._matrixTimer = this.time.addEvent({
            delay: 60,
            loop: true,
            callback: () => {
                if (!this._matrixColumns) return;
                this._matrixColumns.forEach((col) => {
                    col.y += col.speed * 0.06;
                    if (col.y > height + col.length * CHAR_H) {
                        col.y = -col.length * CHAR_H;
                        col.speed = Phaser.Math.Between(40, 120);
                    }
                    col.chars.forEach((t, i) => {
                        t.y = col.y + i * CHAR_H;
                        if (Math.random() < 0.04) {
                            t.setText(
                                CHARS[Phaser.Math.Between(0, CHARS.length - 1)],
                            );
                        }
                    });
                });
            },
        });
    }
}
