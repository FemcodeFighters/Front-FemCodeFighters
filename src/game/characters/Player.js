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
            jumpForce: -480,
            attackDamage: stats.attack,
            attackRange: 90,
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
        this._gainEnergy(15);
    }
    onRangedHit() {
        this._gainEnergy(10);
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
        const rain = this.scene.add.particles(0, -50, "spaghetti", {
            x: { min: 0, max: this.scene.scale.width },
            speedY: { min: 400, max: 600 },
            lifespan: 2000,
            quantity: 10,
            frequency: 40,
        });

        this.scene.time.addEvent({
            delay: 400,
            repeat: 12,
            callback: () => {
                if (this.scene.enemy && this.scene.enemy.active) {
                    this.scene.enemy.takeDamage(8, this);
                }
            },
        });
        this.scene.time.delayedCall(5000, () => rain.destroy());
    }

    _executeGitClone() {
        const clone = this.scene.add
            .sprite(this.x, this.y, this.texture.key)
            .setAlpha(0.7)
            .setTint(0x3b82f6);

        const targetX =
            this.scene.enemy && this.scene.enemy.active
                ? this.scene.enemy.x
                : this.x + (this.flipX ? -200 : 200);

        this.scene.tweens.add({
            targets: clone,
            x: targetX,
            duration: 400,
            ease: "Power2",
            onComplete: () => {
                if (this.scene.enemy && this.scene.enemy.active) {
                    this.scene.enemy.takeDamage(35, this);
                }
                clone.destroy();
            },
        });
    }

    _executeFridayDeploy() {
        this.hp = Math.min(this.maxHP, this.hp + 40);
        this.setTint(0x00ffc8);
        this.isInvincible = true;
        this.scene.time.delayedCall(3000, () => {
            this.isInvincible = false;
            this.clearTint();
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
