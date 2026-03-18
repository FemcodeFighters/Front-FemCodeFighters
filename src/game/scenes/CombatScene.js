import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import Player from "../characters/Player";
import Enemy from "../characters/Enemy";
import { getCharacter } from "../../service/playerApi";
import { generateCharacterFrames } from "../../components/molecules/characterSVG";

export default class CombatScene extends Scene {
    constructor() {
        super({
            key: "CombatScene",
            physics: {
                arcade: {
                    gravity: { y: 800 },
                    debug: true,
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
        this.cameras.main.setBackgroundColor("#1a1a2e").fadeIn(500);
        this._createMockupTextures();
        this.platforms = this._createPlatforms(width, height);
        this._createSpaghettiRain();
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
                    if (this.spaghettiRain) this.spaghettiRain.setQuantity(120);
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
                if (this.spaghettiRain) this.spaghettiRain.setQuantity(5);
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
            const serverData = await getCharacter();
            this.registry.set("character", serverData);
            await this._ensurePlayerTexture(serverData);
            this.player = new Player(this, 200, height - 100);
        } catch (error) {
            console.error("Error cargando personaje:", error);
            this.player = new Player(this, 200, height - 100);
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
                "¡STACKOVERFLOW!",
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
                "¡DEBUGGED!",
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
        EventBus.off("player-ultimate-executed");
        EventBus.off("enemy-ultimate-executed");
    }

    _createPlatforms(width, height) {
        const platforms = this.physics.add.staticGroup();
        platforms.add(
            this.add.rectangle(width / 2, height - 30, width, 60, 0x000000),
        );
        return platforms;
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
                frequency: 100,
            })
            .setDepth(1);
    }

    async _ensurePlayerTexture(serverData) {
        if (!serverData || this.textures.exists("player_custom")) return;
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
}
