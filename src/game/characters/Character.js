import Phaser from "phaser";
import Projectile from "./Projectile";
import ImpactEffect from "../characters/effects/ImpactEffect";
import { soundManager } from "../characters/effects/SoundManager";
import { mask, unmask } from "../../game/utils/Security";

export const CharacterState = {
    IDLE: "idle",
    RUN: "run",
    JUMP: "jump",
    FALL: "fall",
    ATTACK: "attack",
    RANGED: "ranged",
    HURT: "hurt",
    DEAD: "dead",
};

export default class Character extends Phaser.Physics.Arcade.Sprite {
    #currentHP;
    #maxHP;
    #attackDamage;
    constructor(scene, x, y, texture, config) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.speed = config.speed ?? 200;
        this.jumpForce = config.jumpForce ?? -480;
        const baseDamage = config.attackDamage ?? 10;
        this.#attackDamage = mask(baseDamage);
        this.attackRange = config.attackRange ?? 60;
        this.attackCooldown = config.attackCooldown ?? 600;
        this.rangedCooldown = config.rangedCooldown ?? 1000;
        this.#maxHP = mask(config.maxHP || 100);
        this.#currentHP = mask(config.maxHP || 100);
        this.body.setGravityY(1000);
        this.body.setCollideWorldBounds(true);
        this.body.setImmovable(false);
        this.body.setAllowGravity(true);
        this.body.setMaxVelocity(this.speed, 1000);
        this.body.setOffset(0, 0);
        this.originalScaleX = this.scaleX;
        this.originalScaleY = this.scaleY;
        this.state = CharacterState.IDLE;
        this.facingRight = true;
        this.isOnGround = false;
        this.canAttack = true;
        this.canRanged = true;
        this.isInvincible = false;
        this._hitBoxActive = false;
        this.projectiles = scene.physics.add.group({
            classType: Projectile,
            runChildUpdate: true,
        });
        this._impactEffect = new ImpactEffect(scene);

        this.setCollideWorldBounds(true);
        this.setDisplaySize(config.bodyW ?? 40, config.bodyH ?? 60);
        this.body.setSize(config.bodyW ?? 40, config.bodyH ?? 60);
        this.body.setOffset(0, 0);

        this._attackHitBox = scene.add.rectangle(
            0,
            0,
            this.attackRange,
            40,
            0xff0000,
            0,
        );
        scene.physics.add.existing(this._attackHitBox, true);
        this._attackHitBox.setVisible(false);
    }

    get hp() {
        return unmask(this.#currentHP);
    }

    get maxHP() {
        return unmask(this.#maxHP);
    }

    get attackDamage() {
        return unmask(this.#attackDamage);
    }

    set hp(value) {
        const max = unmask(this.#maxHP);
        const newHP = Phaser.Math.Clamp(value, 0, max);
        this.#currentHP = mask(newHP);

        this.emit("healthChanged", newHP, max);

        if (typeof this._syncWithReact === "function") {
            this._syncWithReact();
        }
    }

    set maxHP(value) {
        this.#maxHP = mask(value);
    }

    update(_delta) {
        if (this.state === CharacterState.DEAD) return;

        this._updateGroundState();
        this._updateHitBoxPosition();
        this._updateState();

        const animKey = this.state.toLowerCase();
        this._playAnimation(animKey);

        if (this.texture.frameTotal <= 1) {
            if (this.state === CharacterState.RUN) {
                this.setAngle(Math.sin(this.scene.time.now / 50) * 5);
            } else if (this.state === CharacterState.JUMP) {
                this.setScale(this.scaleX, 1.1);
            } else {
                this.setAngle(0);
                this.setScale(this.scaleX, 1);
            }
        }
    }
    moveLeft() {
        if (this._isActionLocked()) return;
        this.setVelocityX(-this.speed);
        this.facingRight = false;
        this.setFlipX(true);
        if (this.isOnGround) this.setState(CharacterState.RUN);
    }

    moveRight() {
        if (this._isActionLocked()) return;
        this.setVelocityX(this.speed);
        this.facingRight = true;
        this.setFlipX(false);
        if (this.isOnGround) this.setState(CharacterState.RUN);
    }

    stopHorizontal() {
        if (this._isActionLocked()) return;
        this.setVelocityX(0);
        if (this.isOnGround && this.state === CharacterState.RUN) {
            this.setState(CharacterState.IDLE);
        }
    }

    jump() {
        if (this._isActionLocked()) return;
        if (!this.isOnGround) return;
        this.setVelocityY(this.jumpForce);
        this.setState(CharacterState.JUMP);
    }

    attack() {
        if (this._isActionLocked()) return;
        if (!this.canAttack) return;

        this.setState(CharacterState.ATTACK);
        this.canAttack = false;
        this._showHitBoxFor(200);

        this.scene.time.delayedCall(this.attackCooldown, () => {
            this.canAttack = true;
        });

        this.scene.time.delayedCall(400, () => {
            if (this.state === CharacterState.ATTACK) {
                this.setState(
                    this.isOnGround ? CharacterState.IDLE : CharacterState.FALL,
                );
            }
        });
    }

    rangedAttack() {
        if (this._isActionLocked()) return;
        if (!this.canRanged) return;

        this.setState(CharacterState.RANGED);
        this.canRanged = false;
        const spawnY = this.y - this.displayHeight / 2;

        const projectile = new Projectile(
            this.scene,
            this.x,
            spawnY,
            this,
            this.projectileType ?? "duck",
        );

        this.projectiles.add(projectile);
        projectile.fire(this.facingRight ? 1 : -1);
        soundManager.playRangedShot();

        this.scene.time.delayedCall(this.rangedCooldown, () => {
            this.canRanged = true;
        });

        this.scene.time.delayedCall(350, () => {
            if (this.state === CharacterState.RANGED) {
                this.setState(
                    this.isOnGround ? CharacterState.IDLE : CharacterState.FALL,
                );
            }
        });
    }

    takeDamage(amount, source) {
        if (this.isInvincible || this.state === CharacterState.DEAD) return;
        let current = unmask(this.#currentHP);
        current = Phaser.Math.Clamp(current - amount, 0, unmask(this.#maxHP));
        this.#currentHP = mask(current);
        this._impactEffect.play(this.x, this.y);
        soundManager.playHurt();
        this.emit("healthChanged", this.hp, this.maxHP);
        if (current <= 0) {
            this._die();
            return;
        }
        const direction = source && source.x < this.x ? 1 : -1;
        this.setVelocity(direction * 180, -200);

        this.setState(CharacterState.HURT);
        this._startInvincibility(600);
        this.scene.time.delayedCall(400, () => {
            if (this.state === CharacterState.HURT) {
                this.setState(CharacterState.IDLE);
            }
        });
    }
    checkAttackHit(target) {
        if (this.state !== CharacterState.ATTACK) return false;
        if (!this._hitBoxActive) return false;

        const bounds = this._attackHitBox.getBounds();
        const targetBounds = target.getBounds();

        if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, targetBounds)) {
            target.takeDamage(this.attackDamage, this);
            return true;
        }
        return false;
    }

    checkProjectileHit(target, onHitCallback = null) {
        this.projectiles.getChildren().forEach((projectile) => {
            if (!projectile.active) return;
            const bounds = projectile.getBounds();
            const targetBounds = target.getBounds();
            if (
                Phaser.Geom.Intersects.RectangleToRectangle(
                    bounds,
                    targetBounds,
                )
            ) {
                projectile.onHit(target);
                if (onHitCallback) onHitCallback();
            }
        });
    }

    setState(newState) {
        if (this.state === newState) return this;
        this.state = newState;
        this.emit("stateChanged", newState);
        return this;
    }

    isAlive() {
        return this.state !== CharacterState.DEAD;
    }

    getHealthPercent() {
        return this.hp / this.maxHP;
    }

    _playAnimation(key) {
        if (!key || !this.texture || this.texture.frameTotal <= 1) return;
        const fullKey = this.texture.key + "_" + key;

        if (this.scene.anims.exists(fullKey)) {
            this.play(fullKey, true);
        } else if (this.scene.anims.exists(key)) {
            this.play(key, true);
        }
    }

    _updateGroundState() {
        const wasOnGround = this.isOnGround;

        this.isOnGround = this.body.blocked.down || this.body.touching.down;

        if (!wasOnGround && this.isOnGround) {
            if (
                this.state === CharacterState.JUMP ||
                this.state === CharacterState.FALL
            ) {
                this.setState(CharacterState.IDLE);
                this.scene.tweens.add({
                    targets: this,
                    scaleY: 0.8,
                    scaleX: this.scaleX * 1.2,
                    duration: 100,
                    yoyo: true,
                    ease: "Quad.easeOut",
                    onComplete: () => {
                        this.setScale(
                            this.facingRight
                                ? this.originalScaleX
                                : -this.originalScaleX,
                            this.originalScaleY,
                        );
                    },
                });
            }
        }

        if (
            wasOnGround &&
            !this.isOnGround &&
            this.state !== CharacterState.JUMP &&
            this.state !== CharacterState.ATTACK
        ) {
            this.setState(CharacterState.FALL);
        }
    }

    _updateState() {
        if (
            !this.isOnGround &&
            this.body.velocity.y > 50 &&
            this.state === CharacterState.JUMP
        ) {
            this.setState(CharacterState.FALL);
        }
    }

    _updateHitBoxPosition() {
        const halfWidth = this.displayWidth / 2;
        const offsetX = this.facingRight
            ? this.x + halfWidth
            : this.x - halfWidth - this.attackRange;
        this._attackHitBox.setPosition(
            offsetX + this.attackRange / 2,
            this.y - 10,
        );
    }

    _showHitBoxFor(duration) {
        this._hitBoxActive = true;
        this.scene.time.delayedCall(duration, () => {
            this._hitBoxActive = false;
        });
    }

    _startInvincibility(duration) {
        this.isInvincible = true;

        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.2, to: 1 },
            x: {
                getEnd: () => this.x + (Math.random() * 10 - 5),
                getStart: () => this.x,
            },
            duration: 50,
            repeat: Math.floor(duration / 100),
            yoyo: true,
            onComplete: () => {
                this.setAlpha(1);
                this.isInvincible = false;
            },
        });
    }

    _die() {
        this.setState(CharacterState.DEAD);
        this.setVelocity(0, -300);
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y + 40,
            duration: 600,
            onComplete: () => {
                this.emit("died", this);
                this.destroy();
                this._attackHitBox.destroy();
            },
        });
    }

    _isActionLocked() {
        return (
            this.state === CharacterState.HURT ||
            this.state === CharacterState.DEAD ||
            this.state === CharacterState.ATTACK ||
            this.state === CharacterState.RANGED
        );
    }
}
