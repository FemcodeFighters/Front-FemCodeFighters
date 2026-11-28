import Phaser from "phaser";

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, owner, type = "duck") {
        // Las texturas projectile-duck y projectile-bug las crea createArenaTextures (Arena.js)
        super(scene, x, y, `projectile-${type}`);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.owner = owner;
        this.damage = 30;
        this.speed = 500;
        this.lifespan = 1500;
        this._type = type;
        this.body.setAllowGravity(false);
        this.setDisplaySize(32, 32);
        this.setDepth(10);
        this.deathTimer = null;
    }

    fire(direction) {
        this.setVelocityX(this.speed * direction);
        this.setActive(true);
        this.setVisible(true);
        this.setFlipX(direction < 0);
        this.deathTimer = this.scene.time.delayedCall(this.lifespan, () => {
            if (this.active) this._destroyProjectile();
        });
    }

    update() {
        if (!this.active || !this.body) return;
        this.setAngle(this.angle + (this._type === "bug" ? 8 : 4));
        const { width } = this.scene.scale;
        if (this.x < -100 || this.x > width + 100) {
            this._destroyProjectile();
        }
    }

    onHit(target) {
        if (!this.active || target === this.owner) return;
        if (typeof target.takeDamage === "function") {
            target.takeDamage(this.damage, this.owner);
        }
        this._destroyProjectile();
    }

    _destroyProjectile() {
        if (this.deathTimer) this.deathTimer.remove();
        this.setActive(false);
        this.setVisible(false);
        this.destroy();
    }
}