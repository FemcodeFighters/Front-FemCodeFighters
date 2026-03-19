import Character, { CharacterState } from "./Character";
import { EventBus } from "../EventBus";
import { mask, unmask } from "../../game/utils/Security";

export default class Player extends Character {
    #ultimateEnergy;
    constructor(scene, x, y) {
        const characterData = scene.registry.get("character") || {};
        const stats = characterData.stats || {
            hp: 100,
            speed: 200,
            attack: 15,
        };
        super(scene, x, y, "player_custom", {
            maxHP: stats.hp,
            speed: stats.speed,
            jumpForce: -720,
            attackDamage: stats.attack,
            attackRange: 30,
        });
        this.#ultimateEnergy = mask(0);
        this.energy = 0;
        this.maxEnergy = 100;
        this.ultimateCost = 100;
        this.isAttackCooldown = false;
        this.isRangedCooldown = false;
        this.isUsingUltimate = false;
        this.isInvincible = false;
        this.setOrigin(0.5, 1.0);
        this.setDisplaySize(120, 120);
        const hitboxW = 40;
        const hitboxH = 90;
        this.body.setSize(hitboxW, hitboxH);
        this.body.setOffset((128 - hitboxW) / 2, 128 - hitboxH);

        let rawSkill =
            characterData.ultimateSkill ||
            characterData.ultimate_skill ||
            "FRIDAY_DEPLOY";
        this.selectedUltimate = rawSkill.toString().toUpperCase().trim();
        console.log("PLAYER: Habilidad Activa ->", this.selectedUltimate);
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys({
            attack: Phaser.Input.Keyboard.KeyCodes.F,
            ranged: Phaser.Input.Keyboard.KeyCodes.G,
            ultimate: Phaser.Input.Keyboard.KeyCodes.R,
        });
        this._syncWithReact();
    }

    update(delta) {
        if (!this.scene || !this.active || this.state === CharacterState.DEAD)
            return;
        super.update(delta);
        if (!this._isActionLocked()) {
            if (this.cursors.left.isDown) {
                this.moveLeft();
            } else if (this.cursors.right.isDown) {
                this.moveRight();
            } else {
                this.stopHorizontal();
            }
            if (
                (this.cursors.up.isDown || this.cursors.space.isDown) &&
                this.isOnGround
            ) {
                this.jump();
            }
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.attack))
            this.handleMeleeAttack();
        if (Phaser.Input.Keyboard.JustDown(this.keys.ranged))
            this.handleRangedAttack();
        if (Phaser.Input.Keyboard.JustDown(this.keys.ultimate))
            this.useUltimate();
    }

    handleMeleeAttack() {
        if (this.isAttackCooldown || this._isActionLocked()) return;
        this.attack();
        this.isAttackCooldown = true;
        this._syncWithReact();
        this.scene.time.delayedCall(500, () => {
            this.isAttackCooldown = false;
            this._syncWithReact();
        });
    }

    handleRangedAttack() {
        if (this.isRangedCooldown || this._isActionLocked()) return;
        if (typeof this.rangedAttack === "function") {
            this.rangedAttack();
        }
        this.isRangedCooldown = true;
        this._syncWithReact();
        this.scene.time.delayedCall(1500, () => {
            this.isRangedCooldown = false;
            this._syncWithReact();
        });
    }

    onMeleeHit() {
        this._gainEnergy(6);
    }
    onRangedHit() {
        this._gainEnergy(4);
    }

    _gainEnergy(amount) {
        const currentEnergy = Number(unmask(this.#ultimateEnergy)) || 0;
        let nextEnergy = Math.min(this.maxEnergy, currentEnergy + amount);
        this.#ultimateEnergy = mask(nextEnergy);
        this.energy = nextEnergy;
        this._syncWithReact();
    }

    async useUltimate() {
        const currentEnergy = Number(unmask(this.#ultimateEnergy)) || 0;
        if (this.isUsingUltimate || currentEnergy < this.ultimateCost) return;
        this.isUsingUltimate = true;
        EventBus.emit("request-ultimate", { type: this.selectedUltimate });
        this.#ultimateEnergy = mask(0);
        this.energy = 0;
        this._syncWithReact();
        this.scene.cameras.main.shake(300, 0.02);
        this._executeUltimateLogic();
        EventBus.emit("player-ultimate-executed", {
            type: this.selectedUltimate,
        });
        this.scene.time.delayedCall(3000, () => {
            if (!this.scene || !this.active) return;
            this.isUsingUltimate = false;
            this._syncWithReact();
        });
    }

    _executeUltimateLogic() {
        switch (this.selectedUltimate) {
            case "SPAGHETTI_CODE":
                this._executeSpaghettiRain();
                break;
            case "GIT_CLONE":
                this._executeGitClone();
                break;
            case "FRIDAY_DEPLOY":
                this._executeFridayDeploy();
                break;
            default:
                if (this.scene.enemy && this.scene.enemy.active) {
                    this.scene.enemy.takeDamage(40, this);
                }
        }
    }

    _executeSpaghettiRain() {
        if (!this.scene || !this.active) return;

        const { width, height } = this.scene.scale;

        if (!this.scene.textures.exists("spaghetti_char")) {
            const chars = [
                "0",
                "1",
                "{",
                "}",
                "<",
                ">",
                ";",
                "=",
                "(",
                ")",
                "/",
                "*",
                "&",
                "%",
                "$",
                "#",
                "@",
                "!",
                "~",
                "|",
            ];
            const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xf7df1e, 1);
            g.fillRect(0, 0, 10, 16);
            g.generateTexture("spaghetti_char", 10, 16);
            g.destroy();
        }

        this.scene.tweens.add({
            targets: this,
            alpha: { from: 1, to: 0.3 },
            duration: 80,
            yoyo: true,
            repeat: 5,
            onUpdate: () => {
                if (!this.active) return;
                this.setTint(0xf7df1e);
            },
        });

        const aura = this.scene.add.graphics().setDepth(8);
        let auraRadius = 10;
        const auraTimer = this.scene.time.addEvent({
            delay: 30,
            repeat: 15,
            callback: () => {
                if (!this.scene) return;
                aura.clear();
                aura.lineStyle(2, 0xf7df1e, 1 - auraRadius / 80);
                aura.strokeCircle(this.x, this.y - 50, auraRadius);
                auraRadius += 4;
            },
        });

        this.scene.time.delayedCall(500, () => {
            if (!this.scene || !this.active) return;

            this.clearTint();
            aura.destroy();

            this.scene.cameras.main.flash(300, 247, 223, 30, false);
            this.scene.cameras.main.shake(200, 0.008);

            const rain = this.scene.add
                .particles(0, -20, "spaghetti_code", {
                    x: { min: 0, max: width },
                    speedY: { min: 600, max: 900 },
                    speedX: { min: -40, max: 40 },
                    scaleY: { min: 1.5, max: 3 },
                    alpha: { start: 1, end: 0.4 },
                    tint: [0xf7df1e, 0xffd700, 0xffffff],
                    lifespan: 1200,
                    quantity: 8,
                    frequency: 25,
                    gravityY: 200,
                })
                .setDepth(3);

            const codeColumns = [];
            const COLS = 20;
            const CHARS = "01{}()<>/=;&#@!~|$%*";
            for (let col = 0; col < COLS; col++) {
                const cx = (col / COLS) * width + width / COLS / 2;
                const speed = Phaser.Math.Between(300, 600);
                const length = Phaser.Math.Between(4, 10);
                const startY = Phaser.Math.Between(-200, 0);
                const column = { cx, y: startY, speed, chars: [] };

                for (let i = 0; i < length; i++) {
                    const alpha = i === length - 1 ? 1 : (i / length) * 0.6;
                    const color = i === length - 1 ? "#ffffff" : "#f7df1e";
                    const t = this.scene.add
                        .text(
                            cx,
                            startY + i * 16,
                            CHARS[Phaser.Math.Between(0, CHARS.length - 1)],
                            {
                                fontFamily: "monospace",
                                fontSize: "13px",
                                color,
                            },
                        )
                        .setOrigin(0.5, 0)
                        .setAlpha(alpha * 0.5)
                        .setDepth(2);
                    column.chars.push(t);
                }
                codeColumns.push(column);
            }

            const codeTimer = this.scene.time.addEvent({
                delay: 50,
                loop: true,
                callback: () => {
                    if (!this.scene) return;
                    codeColumns.forEach((col) => {
                        col.y += col.speed * 0.05;
                        if (col.y > height + col.chars.length * 16) {
                            col.y = -col.chars.length * 16;
                            col.speed = Phaser.Math.Between(300, 600);
                        }
                        col.chars.forEach((t, i) => {
                            t.y = col.y + i * 16;
                            if (Math.random() < 0.06) {
                                t.setText(
                                    CHARS[
                                        Phaser.Math.Between(0, CHARS.length - 1)
                                    ],
                                );
                            }
                        });
                    });
                },
            });

            this.scene.time.addEvent({
                delay: 400,
                repeat: 12,
                callback: () => {
                    if (!this.scene || !this.active) return;
                    const enemy = this.scene.enemy;
                    if (!enemy || !enemy.active || !enemy.body) return;

                    enemy.takeDamage(8, this);
                    this.scene.cameras.main.shake(80, 0.004);

                    if (enemy.active) enemy.setTint(0xf7df1e);

                    this.scene.time.delayedCall(150, () => {
                        if (!this.scene) return;
                        const e = this.scene.enemy;
                        if (e && e.active && e.body) e.clearTint();
                    });

                    if (!enemy.active) return;
                    const dmgText = this.scene.add
                        .text(
                            enemy.x + Phaser.Math.Between(-30, 30),
                            enemy.y - 60,
                            "-8 BUG",
                            {
                                fontFamily: "Orbitron",
                                fontSize: "16px",
                                fill: "#f7df1e",
                                stroke: "#000",
                                strokeThickness: 4,
                            },
                        )
                        .setOrigin(0.5)
                        .setDepth(2000);

                    this.scene.tweens.add({
                        targets: dmgText,
                        y: dmgText.y - 50,
                        alpha: 0,
                        duration: 600,
                        ease: "Power2.out",
                        onComplete: () => dmgText.destroy(),
                    });
                },
            });

            this.scene.time.delayedCall(5000, () => {
                if (!this.scene) return;
                rain.destroy();
                codeTimer.remove();
                codeColumns.forEach((col) =>
                    col.chars.forEach((t) => t.destroy()),
                );
                this.scene.cameras.main.flash(200, 0, 0, 0, false);
            });
        });
    }

    _executeGitClone() {
        if (!this.scene || !this.active) return;

        const dir = this.facingRight ? 1 : -1;
        const targetX = this.scene.enemy?.active
            ? this.scene.enemy.x
            : this.x + dir * 300;

        const clone = this.scene.add
            .sprite(this.x, this.y, this.texture.key)
            .setOrigin(0.5, 1.0)
            .setDisplaySize(120, 120)
            .setAlpha(0)
            .setTint(0x3b82f6)
            .setFlipX(this.flipX)
            .setDepth(5);

        if (!this.scene.textures.exists("clone_particle")) {
            const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x3b82f6, 1);
            g.fillRect(0, 0, 6, 6);
            g.generateTexture("clone_particle", 6, 6);
            g.destroy();
        }

        const trail = this.scene.add
            .particles(clone.x, clone.y, "clone_particle", {
                speed: { min: 20, max: 60 },
                scale: { start: 1, end: 0 },
                alpha: { start: 0.7, end: 0 },
                tint: [0x3b82f6, 0x00ccff, 0xffffff],
                lifespan: 300,
                frequency: 20,
                emitting: false,
            })
            .setDepth(4);
        trail.startFollow(clone);

        let glitchCount = 0;
        const glitchInterval = this.scene.time.addEvent({
            delay: 40,
            repeat: 7,
            callback: () => {
                if (!clone.active) return;
                glitchCount++;
                clone.setAlpha(glitchCount % 2 === 0 ? 0 : 0.9);
                clone.setX(this.x + Phaser.Math.Between(-8, 8));
                clone.setTint(glitchCount % 2 === 0 ? 0x00ccff : 0x3b82f6);
            },
        });

        this.scene.time.delayedCall(340, () => {
            if (!this.scene || !clone.active) return;

            clone.setAlpha(0.85);
            clone.setX(this.x);
            trail.emitting = true;

            this.scene.tweens.add({
                targets: clone,
                x: targetX,
                duration: 280,
                ease: "Power3.out",
                onUpdate: () => {
                    clone.setTint(0x00ccff);
                },
                onComplete: () => {
                    if (!this.scene) return;

                    trail.emitting = false;

                    if (this.scene.enemy?.active) {
                        this.scene.enemy.takeDamage(35, this);
                    }

                    const boom = this.scene.add
                        .particles(clone.x, clone.y, "clone_particle", {
                            speed: { min: 150, max: 400 },
                            angle: { min: 0, max: 360 },
                            scale: { start: 1.5, end: 0 },
                            alpha: { start: 1, end: 0 },
                            tint: [0x3b82f6, 0x00ccff, 0xffffff, 0x7c3aed],
                            lifespan: 500,
                            quantity: 40,
                            emitting: false,
                            gravityY: 200,
                        })
                        .setDepth(6);
                    boom.explode(40);

                    this.scene.cameras.main.flash(200, 59, 130, 246, false);

                    const disintegrate = this.scene.add
                        .particles(clone.x, clone.y, "clone_particle", {
                            speed: { min: 60, max: 180 },
                            angle: { min: -30, max: 30 },
                            scale: { start: 1, end: 0 },
                            alpha: { start: 0.9, end: 0 },
                            tint: [0x3b82f6, 0x00ccff],
                            lifespan: 400,
                            quantity: 20,
                            emitting: false,
                            gravityY: 300,
                        })
                        .setDepth(5);

                    this.scene.tweens.add({
                        targets: clone,
                        alpha: 0,
                        scaleX: 0.3,
                        scaleY: 1.4,
                        duration: 300,
                        ease: "Power2.in",
                        onUpdate: (tween) => {
                            if (
                                tween.progress > 0.3 &&
                                !disintegrate._started
                            ) {
                                disintegrate._started = true;
                                disintegrate.explode(20);
                            }
                        },
                        onComplete: () => {
                            clone.destroy();
                            this.scene?.time.delayedCall(600, () => {
                                boom.destroy();
                                disintegrate.destroy();
                                trail.destroy();
                            });
                        },
                    });
                },
            });
        });
    }

    _executeFridayDeploy() {
        if (!this.scene || !this.active) return;

        const { width, height } = this.scene.scale;
        const CHARS = "01ABCDEFabcdef{}[]<>/=;:#@!~|$%*";
        const GREEN = "#00ff41";
        const GREENDIM = "#00cc33";

        const lines = [
            "> git push origin main",
            "> deploying to production...",
            "> build: SUCCESS",
            "> tests: SKIPPED (it's friday)",
            "> upload: 100% ████████████",
            "> DEPLOY COMPLETE — good luck",
            "> servidor: online",
            "> rollback: disabled (yolo)",
        ];

        const terminalTexts = [];
        lines.forEach((line, i) => {
            const t = this.scene.add
                .text(40, height - 80 - i * 22, line, {
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "13px",
                    color: i === lines.length - 1 ? "#ffffff" : GREEN,
                    alpha: 0,
                })
                .setDepth(3000)
                .setAlpha(0);
            terminalTexts.push(t);

            this.scene.tweens.add({
                targets: t,
                alpha: 0.85,
                duration: 120,
                delay: i * 80,
                ease: "Power1",
            });
        });

        const overlay = this.scene.add
            .rectangle(width / 2, height / 2, width, height, 0x00ff41, 0.06)
            .setDepth(2999);

        const scanline = this.scene.add
            .rectangle(width / 2, 0, width, 3, 0x00ff41, 0.4)
            .setDepth(3001);

        this.scene.tweens.add({
            targets: scanline,
            y: height,
            duration: 600,
            ease: "Linear",
            onComplete: () => scanline.destroy(),
        });

        if (!this.scene.textures.exists("deploy_particle")) {
            const g = this.scene.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x00ff41, 1);
            g.fillRect(0, 0, 8, 2);
            g.generateTexture("deploy_particle", 8, 2);
            g.destroy();
        }

        const uploadStream = this.scene.add
            .particles(this.x, this.y - 40, "deploy_particle", {
                speedY: { min: -400, max: -700 },
                speedX: { min: -30, max: 30 },
                scale: { start: 1, end: 0 },
                alpha: { start: 0.9, end: 0 },
                tint: [0x00ff41, 0x00ffc8, 0xffffff],
                lifespan: 800,
                quantity: 4,
                frequency: 30,
            })
            .setDepth(3000);
        uploadStream.startFollow(this);
        const floatingChars = [];
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const radius = Phaser.Math.Between(40, 80);
            const cx = this.x + Math.cos(angle) * radius;
            const cy = this.y - 50 + Math.sin(angle) * radius;
            const fc = this.scene.add
                .text(cx, cy, CHARS[Phaser.Math.Between(0, CHARS.length - 1)], {
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: GREEN,
                })
                .setOrigin(0.5)
                .setAlpha(0)
                .setDepth(3000);

            this.scene.tweens.add({
                targets: fc,
                alpha: 0.7,
                y: cy - Phaser.Math.Between(30, 80),
                duration: Phaser.Math.Between(400, 800),
                delay: Phaser.Math.Between(0, 300),
                ease: "Power2.out",
                onComplete: () => {
                    this.scene?.tweens.add({
                        targets: fc,
                        alpha: 0,
                        duration: 300,
                        onComplete: () => fc.destroy(),
                    });
                },
            });
            floatingChars.push(fc);
        }

        this.scene.cameras.main.flash(400, 0, 255, 65, false);

        this.scene.time.delayedCall(600, () => {
            if (!this.scene || !this.active) return;

            const healAmount = Math.min(this.maxHP - this.hp, 40);
            this.hp = Math.min(this.maxHP, this.hp + 40);

            const healText = this.scene.add
                .text(this.x, this.y - 80, `+${healAmount} HP`, {
                    fontFamily: "Orbitron",
                    fontSize: "28px",
                    fill: GREEN,
                    stroke: "#000000",
                    strokeThickness: 6,
                })
                .setOrigin(0.5)
                .setDepth(3000)
                .setAlpha(0);

            this.scene.tweens.add({
                targets: healText,
                alpha: 1,
                y: healText.y - 60,
                scale: { from: 0.5, to: 1.2 },
                duration: 400,
                ease: "Back.out",
                onComplete: () => {
                    this.scene?.tweens.add({
                        targets: healText,
                        alpha: 0,
                        y: healText.y - 30,
                        duration: 500,
                        delay: 600,
                        onComplete: () => healText.destroy(),
                    });
                },
            });

            this.setTint(0x00ffc8);
            this.isInvincible = true;

            const blinkTimer = this.scene.time.addEvent({
                delay: 200,
                loop: true,
                callback: () => {
                    if (!this.active) return;
                    this.setTint(
                        this.tintTopLeft === 0x00ffc8 ? 0x00ff41 : 0x00ffc8,
                    );
                },
            });

            this.scene.time.delayedCall(3000, () => {
                if (!this.scene || !this.active) return;

                blinkTimer.remove();
                this.isInvincible = false;
                this.clearTint();
                uploadStream.destroy();
                overlay.destroy();

                terminalTexts.forEach((t, i) => {
                    this.scene?.tweens.add({
                        targets: t,
                        alpha: 0,
                        duration: 200,
                        delay: i * 40,
                        onComplete: () => t.destroy(),
                    });
                });

                this.scene.cameras.main.flash(150, 255, 255, 255, false);
            });
        });
    }

    _syncWithReact() {
        EventBus.emit("player-ultimate", {
            energy: this.energy,
            max: this.maxEnergy,
            ready: this.energy >= this.ultimateCost,
        });

        EventBus.emit("player-cooldown-attack", !this.isAttackCooldown);
        EventBus.emit("player-cooldown-ranged", !this.isRangedCooldown);
        EventBus.emit("player-stats", { hp: this.hp, maxHP: this.maxHP });
    }

    takeDamage(amount, source) {
        if (this.isInvincible || this.state === CharacterState.DEAD) return;
        super.takeDamage(amount, source);
        EventBus.emit("player-damaged");
        this._syncWithReact();
    }
}
