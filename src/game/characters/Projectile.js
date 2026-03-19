import Phaser from "phaser";

const SVGS = {
    duck: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <ellipse cx="16" cy="20" rx="12" ry="9" fill="#f7df1e"/>
        <ellipse cx="14" cy="22" rx="7" ry="4" fill="#e6c800"/>
        <ellipse cx="22" cy="12" rx="8" ry="7" fill="#f7df1e"/>
        <path d="M28 12 L34 10 L34 14 Z" fill="#ff8c00"/>
        <circle cx="24" cy="10" r="2" fill="#0a0a0a"/>
        <circle cx="24.8" cy="9.2" r="0.7" fill="#fff"/>
        <ellipse cx="19" cy="15" rx="4" ry="3" fill="#f7df1e"/>
        <path d="M4 18 Q0 14 2 20 Q0 24 4 22 Z" fill="#e6c800"/>
    </svg>`,

    bug: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
        <ellipse cx="16" cy="18" rx="8" ry="10" fill="#22c55e"/>
        <ellipse cx="16" cy="9" rx="6" ry="5" fill="#16a34a"/>
        <circle cx="13" cy="8" r="1.8" fill="#fff"/>
        <circle cx="19" cy="8" r="1.8" fill="#fff"/>
        <circle cx="13.5" cy="8" r="1" fill="#0a0a0a"/>
        <circle cx="19.5" cy="8" r="1" fill="#0a0a0a"/>
        <line x1="13" y1="4" x2="10" y2="0" stroke="#16a34a" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="19" y1="4" x2="22" y2="0" stroke="#16a34a" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="10" cy="0" r="1.2" fill="#16a34a"/>
        <circle cx="22" cy="0" r="1.2" fill="#16a34a"/>
        <line x1="8" y1="14" x2="3" y2="11" stroke="#15803d" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="8" y1="18" x2="2" y2="18" stroke="#15803d" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="8" y1="22" x2="3" y2="25" stroke="#15803d" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="24" y1="14" x2="29" y2="11" stroke="#15803d" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="24" y1="18" x2="30" y2="18" stroke="#15803d" stroke-width="1.2" stroke-linecap="round"/>
        <line x1="24" y1="22" x2="29" y2="25" stroke="#15803d" stroke-width="1.2" stroke-linecap="round"/>
        <ellipse cx="16" cy="16" rx="6" ry="1.5" fill="#15803d" opacity="0.4"/>
        <ellipse cx="16" cy="20" rx="6" ry="1.5" fill="#15803d" opacity="0.4"/>
    </svg>`,
};

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, owner, type = "duck") {
        const textureKey = `projectile-${type}`;
        if (!scene.textures.exists(textureKey)) {
            const svgString = SVGS[type] || SVGS.duck;
            const b64 = btoa(unescape(encodeURIComponent(svgString)));
            const dataURI = `data:image/svg+xml;base64,${b64}`;
            scene.textures.addBase64(textureKey, dataURI);
        }
        super(scene, x, y, textureKey);
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
        const { width, height } = this.scene.scale;
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