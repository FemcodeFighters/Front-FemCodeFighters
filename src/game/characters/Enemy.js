import Phaser from "phaser";
import Character from "./Character";
import Ultimate from "./Ultimate";
import { EventBus } from "../EventBus";
import { mask, unmask } from "../utils/Security";

const AIState = {
    IDLE: "ai_idle",
    CHASE: "ai_chase",
    ATTACK: "ai_attack",
    RANGED: "ai_ranged",
    RETREAT: "ai_retreat",
};

export default class Enemy extends Character {
    #ultimateEnergy;

    constructor(scene, x, y, type = "JAVASCRIPT") {
        const textureKey = scene.textures.exists(type) ? type : "JAVASCRIPT";

        super(scene, x, y, textureKey, {
            maxHP: 80,
            speed: 150,
            jumpForce: -400,
            attackDamage: 5,
            attackRange: 55,
        });

        this.enemyType = type;
        this.projectileType = "bug";

        this.setOrigin(0.5, 1.0);
        this.setDisplaySize(110, 110);

        const eHitboxW = 50;
        const eHitboxH = 90;
        this.body.setSize(eHitboxW, eHitboxH);
        this.body.setOffset(
            (this.width - eHitboxW) / 2,
            this.height - eHitboxH,
        );
        this.body.setCollideWorldBounds(true);
        const labelConfigs = {
            HTML: { bg: "#E44D26", text: "#fff" },
            CSS: { bg: "#264DE4", text: "#fff" },
            JAVASCRIPT: { bg: "#f7df1e", text: "#000" },
            REACT: { bg: "#61DAFB", text: "#000" },
            JAVA: { bg: "#5382A1", text: "#fff" },
            SPRINGBOOT: { bg: "#6DB33F", text: "#fff" },
        };

        this.ultimateConfigs = {
            HTML: {
                tint: [0xe44d26, 0xffffff],
                damage: 25,
                text: "TAG SOUP ATTACK",
            },
            CSS: {
                tint: [0x264de4, 0x00ffff],
                damage: 30,
                text: "Z-INDEX EXPLOSION",
            },
            JAVASCRIPT: {
                tint: [0xf7df1e, 0x000000],
                damage: 40,
                text: "SPAGHETTI CRASH",
            },
            REACT: {
                tint: [0x61dafb, 0xffffff],
                damage: 45,
                text: "RE-RENDER OVERLOAD",
            },
            JAVA: {
                tint: [0x5382a1, 0xf8981d],
                damage: 55,
                text: "NULL POINTER EXCEPTION",
            },
            SPRINGBOOT: {
                tint: [0x6db33f, 0x3e8610],
                damage: 70,
                text: "BEAN CREATION FATAL",
            },
        };

        const style = labelConfigs[type] || labelConfigs["JAVASCRIPT"];

        this._labelText = scene.add
            .text(x, y - 120, type, {
                fontSize: "12px",
                fontFamily: "monospace",
                fontWeight: "bold",
                color: style.text,
                backgroundColor: style.bg,
                padding: { x: 4, y: 2 },
            })
            .setOrigin(0.5)
            .setDepth(10);

        this.#ultimateEnergy = mask(0);
        this.ultimateMaxEnergy = 100;
        this.ultimateReady = false;

        const config =
            this.ultimateConfigs[type] || this.ultimateConfigs["JAVASCRIPT"];
        this._ultimateKey = config.text;
        this._ultimate = new Ultimate(scene, this, this._ultimateKey);

        const particleTexture = scene.textures.exists("bug") ? "bug" : null;
        this._dangerParticles = scene.add.particles(0, 0, particleTexture, {
            speed: { min: 60, max: 120 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: 0xff0000,
            lifespan: 500,
            emitting: false,
        });
        this._dangerParticles.startFollow(this);

        this._aiState = AIState.IDLE;
        this._target = null;
        this._thinkTimer = 0;
        this._thinkInterval = 800;
    }

    isAlive() {
        return this.hp > 0 && this.active && this.body;
    }

    takeDamage(amount, source) {
        if (!this.isAlive() || !this.visible) return;

        super.takeDamage(amount, source);
        this.emit("healthChanged");

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        if (!this.active) return;
        this.emit("died");
        this._stopDangerParticles();

        if (this._labelText) this._labelText.destroy();
        if (this.body) this.body.enable = false;

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 500,
            onComplete: () => this.destroy(),
        });
    }

    update(delta, target) {
        if (!this.isAlive()) return;

        super.update(delta);

        if (!target || !target.active || target.hp <= 0) {
            this._stopDangerParticles();
            this.stopHorizontal();
            return;
        }

        this._target = target;
        this._thinkTimer += delta;

        if (this._thinkTimer >= this._thinkInterval) {
            this._thinkTimer = 0;
            this._think();
        }

        this._executeAI();

        if (this._labelText) {
            this._labelText.setPosition(this.x, this.y - 120);
        }
    }

    onMeleeHit() {
        this._gainEnergy(20);
    }
    onRangedHit() {
        this._gainEnergy(35);
    }

    _gainEnergy(amount) {
        if (this.ultimateReady) return;
        let current = Number(unmask(this.#ultimateEnergy)) || 0;
        current = Math.min(this.ultimateMaxEnergy, current + amount);
        this.#ultimateEnergy = mask(current);

        if (current >= this.ultimateMaxEnergy) {
            this.ultimateReady = true;
            this._startDangerParticles();
        }
    }

    _think() {
        const dist = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            this._target.x,
            this._target.y,
        );
        if (this.ultimateReady && dist < 200) {
            this._activateUltimate();
            return;
        }

        if (dist < this.attackRange + 20) {
            this._aiState = AIState.ATTACK;
        } else if (dist > 150) {
            this._aiState = AIState.RANGED;
        } else {
            this._aiState = AIState.CHASE;
        }
    }

    _executeAI() {
        switch (this._aiState) {
            case AIState.CHASE:
                this._chaseTarget();
                break;
            case AIState.ATTACK:
                this._attemptAttack();
                break;
            case AIState.RANGED:
                this._attemptRanged();
                break;
            default:
                this.stopHorizontal();
        }
    }

    _chaseTarget() {
        const diff = this._target.x - this.x;
        if (Math.abs(diff) < 10) {
            this.stopHorizontal();
        } else if (diff > 0) {
            this.moveRight();
        } else {
            this.moveLeft();
        }
    }

    _attemptAttack() {
        this.stopHorizontal();
        this.setFlipX(this._target.x < this.x);
        this.attack();
    }

    _attemptRanged() {
        this.stopHorizontal();
        this.setFlipX(this._target.x < this.x);
        if (this.canRanged) {
            this.setTint(0xffaaaa);
            this.scene.time.delayedCall(200, () => {
                if (this.active) {
                    this.rangedAttack();
                    this.clearTint();
                }
            });
        }
    }

    _activateUltimate() {
        if (!this.ultimateReady) return;
        this.ultimateReady = false;
        this.#ultimateEnergy = mask(0);
        this._stopDangerParticles();

        EventBus.emit("enemy-ultimate-executed", { type: this.enemyType });

        if (this._ultimate && typeof this._ultimate.activate === "function") {
            this._ultimate.activate([this._target]);
        }

        this.scene.cameras.main.shake(500, 0.03);

        this.scene.time.delayedCall(600, () => {
            if (this.active) this._executeSystemCrash();
        });
    }

    _executeSystemCrash() {
        const config =
            this.ultimateConfigs[this.enemyType] ||
            this.ultimateConfigs["JAVASCRIPT"];
        const crashEmitter = this.scene.add.particles(
            this.x,
            this.y,
            this.texture.key,
            {
                speed: { min: 300, max: 700 },
                angle: { min: 0, max: 360 },
                scale: { start: 0.8, end: 0.1 },
                alpha: { start: 1, end: 0 },
                gravityY: 400,
                lifespan: 1200,
                quantity: 30,
                tint: config.tint,
                blendMode: "ADD",
            },
        );
        if (this._target && this._target.active) {
            const dist = Phaser.Math.Distance.Between(
                this.x,
                this.y,
                this._target.x,
                this._target.y,
            );
            if (dist < 250) {
                this._target.takeDamage(config.damage, this);
                this._target.setTint(0xff0000);
                this.scene.time.delayedCall(500, () => {
                    if (this._target && this._target.active)
                        this._target.clearTint();
                });
            }
        }
        this.setVisible(false);
        if (this.body) this.body.enable = false;
        this.scene.time.delayedCall(1200, () => {
            crashEmitter.destroy();
            this.hp = 0;
            this.die();
        });
    }
    _startDangerParticles() {
        if (this._dangerParticles) this._dangerParticles.emitting = true;
        this.setTint(0xff0000);
    }

    _stopDangerParticles() {
        if (this._dangerParticles) this._dangerParticles.emitting = false;
        this.clearTint();
    }

    destroy(fromScene) {
        if (this._labelText) this._labelText.destroy();
        if (this._dangerParticles) this._dangerParticles.destroy();
        super.destroy(fromScene);
    }
}
