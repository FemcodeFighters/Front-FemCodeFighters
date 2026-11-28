import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import Player from "../characters/Player";
import Enemy from "../characters/Enemy";
import { getCharacter, getUltimateConfig } from "../../service/playerApi";
import { generateCharacterFrames } from "../../components/molecules/characterSVG";
import { loadEnemyTextures } from "../../components/molecules/enemySVG";
import {
    createArenaTextures,
    createArenaBackground,
    createArenaPlatforms,
} from "../utils/Arena";
import { showNextStackAnnouncement } from "../characters/effects/NextStackAnnouncement";
import { playVictoryEffect } from "../characters/effects/VictoryEffect";
import { addSvgTexture } from "../utils/svgTexture";

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
        createArenaTextures(this);
createArenaBackground(this, width, height);
this.platforms = createArenaPlatforms(this, width, height);
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

showNextStackAnnouncement(this, type);
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
    await addSvgTexture(
        this,
        "player_custom",
        generateCharacterFrames(serverData, "idle")[0],
        { replace: true },
    );
}

    _finalBossEffect() {
    playVictoryEffect(this, () => this._onCombatEnd("player"));
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