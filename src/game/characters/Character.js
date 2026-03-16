import Phaser from 'phaser';
import Projectile from './Projectile';
import ImpactEffect from '../characters/effects/ImpactEffect';
import { soundManager } from '../characters/effects/SoundManager';

export const CharacterState = {
    IDLE:   'idle',
    RUN:    'run',
    JUMP:   'jump',
    FALL:   'fall',
    ATTACK: 'attack',
    RANGED: 'ranged',
    HURT:   'hurt',
    DEAD:   'dead',
};

export default class Character extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, config = {}) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.maxHP          = config.maxHP          ?? 100;
        this.hp             = this.maxHP;
        this.speed          = config.speed          ?? 200;
        this.jumpForce      = config.jumpForce      ?? -480;
        this.attackDamage   = config.attackDamage   ?? 10;
        this.attackRange    = config.attackRange    ?? 60;
        this.attackCooldown = config.attackCooldown ?? 600;
        this.rangedCooldown = config.rangedCooldown ?? 1000;

        this.state         = CharacterState.IDLE;
        this.facingRight   = true;
        this.isOnGround    = false;
        this.canAttack     = true;
        this.canRanged     = true;
        this.isInvincible  = false;
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

        this._attackHitBox = scene.add.rectangle(0, 0, this.attackRange, 40, 0xff0000, 0);
        scene.physics.add.existing(this._attackHitBox, true);
        this._attackHitBox.setVisible(false);
    }

    update(_delta) {
        if (this.state === CharacterState.DEAD) return;
        this._updateGroundState();
        this._updateHitBoxPosition();
        this._updateState();
        this._playAnimation();
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
                this.setState(this.isOnGround ? CharacterState.IDLE : CharacterState.FALL);
            }
        });
    }

    rangedAttack() {
        if (this._isActionLocked()) return;
        if (!this.canRanged) return;

        this.setState(CharacterState.RANGED);
        this.canRanged = false;

        const projectile = new Projectile(this.scene, this.x, this.y, this, this.projectileType ?? 'duck');
        this.projectiles.add(projectile);
        projectile.fire(this.facingRight ? 1 : -1);
        soundManager.playRangedShot();

        this.scene.time.delayedCall(this.rangedCooldown, () => {
            this.canRanged = true;
        });

        this.scene.time.delayedCall(350, () => {
            if (this.state === CharacterState.RANGED) {
                this.setState(this.isOnGround ? CharacterState.IDLE : CharacterState.FALL);
            }
        });
    }

    takeDamage(amount, source) {
        if (this.isInvincible || this.state === CharacterState.DEAD) return;

        this.hp = Math.max(0, this.hp - amount);
this._impactEffect.play(this.x, this.y);
soundManager.playHurt();
        this.emit('healthChanged', this.hp, this.maxHP);

        if (this.hp <= 0) {
            this._die();
            return;
        }

        const direction = source.x < this.x ? 1 : -1;
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

        const bounds       = this._attackHitBox.getBounds();
        const targetBounds = target.getBounds();

        if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, targetBounds)) {
            target.takeDamage(this.attackDamage, this);
            return true;
        }
        return false;
    }

    // onHitCallback — se llama cuando un proyectil impacta (para acumular energía)
    checkProjectileHit(target, onHitCallback = null) {
        this.projectiles.getChildren().forEach(projectile => {
            if (!projectile.active) return;
            const bounds       = projectile.getBounds();
            const targetBounds = target.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(bounds, targetBounds)) {
                projectile.onHit(target);
                if (onHitCallback) onHitCallback();
            }
        });
    }

    setState(newState) {
        if (this.state === newState) return this;
        this.state = newState;
        this.emit('stateChanged', newState);
        return this;
    }

    isAlive() {
        return this.state !== CharacterState.DEAD;
    }

    getHealthPercent() {
        return this.hp / this.maxHP;
    }

    _playAnimation() {
        // Sobreescribir en subclases
    }

    _updateGroundState() {
        const wasOnGround = this.isOnGround;
        this.isOnGround   = this.body.blocked.down;

        if (!wasOnGround && this.isOnGround) {
            if (this.state === CharacterState.JUMP || this.state === CharacterState.FALL) {
                this.setState(CharacterState.IDLE);
            }
        }

        if (wasOnGround && !this.isOnGround && this.state !== CharacterState.JUMP) {
            this.setState(CharacterState.FALL);
        }
    }

    _updateState() {
        if (!this.isOnGround && this.body.velocity.y > 50 && this.state === CharacterState.JUMP) {
            this.setState(CharacterState.FALL);
        }
    }

    _updateHitBoxPosition() {
        const offsetX = this.facingRight
            ? this.x + this.width / 2
            : this.x - this.width / 2 - this.attackRange;
        this._attackHitBox.setPosition(offsetX + this.attackRange / 2, this.y);
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
            targets:  this,
            alpha:    { from: 0.3, to: 1 },
            duration: 80,
            repeat:   Math.floor(duration / 160),
            yoyo:     true,
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
            targets:  this,
            alpha:    0,
            y:        this.y + 40,
            duration: 600,
            onComplete: () => {
                this.emit('died', this);
                this.destroy();
                this._attackHitBox.destroy();
            },
        });
    }

    _isActionLocked() {
        return (
            this.state === CharacterState.HURT   ||
            this.state === CharacterState.DEAD   ||
            this.state === CharacterState.ATTACK ||
            this.state === CharacterState.RANGED
        );
    }
}
