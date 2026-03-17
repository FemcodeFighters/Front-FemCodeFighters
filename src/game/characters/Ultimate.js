import Phaser from "phaser";

export default class Ultimate {
    constructor(scene, owner, skillKey) {
        this.scene = scene;
        this.owner = owner;
        this.skillKey = skillKey;
        this._active = false;
        this._hitbox = scene.add.rectangle(0, 0, 120, 80, 0xffffff, 0);
        scene.physics.add.existing(this._hitbox, true);
        this._hitbox.setVisible(false);
    }

    activate(targets) {
        if (this._active) return;
        this._active = true;
        switch (this.skillKey) {
            case "FRIDAY_DEPLOY":
                this._executeFridayDeploy();
                break;
            case "SPAGHETTI_CODE":
                this._executeSpaghettiCode(targets);
                break;
            case "GIT_CLONE":
                this._executeGitClone(targets);
                break;
            default:
                this._executeDashAttack(targets);
        }
    }

    _executeFridayDeploy() {
        this.owner.isInvincible = true;

        for (let i = 0; i < 15; i++) {
            this.scene.time.delayedCall(i * 50, () => {
                const x = this.owner.x + Phaser.Math.Between(-50, 50);
                const y = this.owner.y + Phaser.Math.Between(-80, 20);
                const txt = this.scene.add.text(x, y, "⚠️ FIXING...", {
                    color: "#00ff00",
                    fontSize: "12px",
                });

                this.scene.tweens.add({
                    targets: txt,
                    y: y - 100,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => txt.destroy(),
                });
            });
        }

        this.owner.setTint(0x00ff00);
        this.scene.time.delayedCall(500, () => {
            this.owner.clearTint();
            this.owner.isInvincible = false;
            this._active = false;
        });
    }

    _executeSpaghettiCode(targets) {
        const direction = this.owner.facingRight ? 1 : -1;

        for (let i = 0; i < 10; i++) {
            const curve = new Phaser.Curves.Spline([
                this.owner.x,
                this.owner.y,
                this.owner.x + 100 * direction,
                this.owner.y - Phaser.Math.Between(50, 150),
                this.owner.x + 300 * direction,
                this.owner.y + Phaser.Math.Between(-20, 20),
            ]);

            const graphics = this.scene.add.graphics();
            graphics.lineStyle(3, 0xffff00, 1);

            this.scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: 600,
                onUpdate: (tween) => {
                    const t = tween.getValue();
                    graphics.clear();
                    graphics.lineStyle(3, 0xffff00, 1 - t);
                    curve.draw(graphics, 64);
                },
                onComplete: () => {
                    graphics.destroy();
                    this._active = false;
                },
            });
        }

        targets.forEach((t) => {
            if (
                Phaser.Math.Distance.Between(
                    this.owner.x,
                    this.owner.y,
                    t.x,
                    t.y,
                ) < 300
            ) {
                t.takeDamage(15, this.owner);
            }
        });
    }

    _executeGitClone(targets) {
        const clone = this.scene.add
            .sprite(this.owner.x, this.owner.y, this.owner.texture.key)
            .setAlpha(0.5)
            .setTint(0x3b82f6)
            .setScale(this.owner.scaleX, this.owner.scaleY);

        this.scene.physics.add.existing(clone);
        const direction = this.owner.facingRight ? 1 : -1;

        clone.body.setVelocityX(1200 * direction);

        this.scene.time.delayedCall(300, () => {
            this._spawnImpactEffect(clone.x, clone.y);
            targets.forEach((t) => {
                if (
                    Phaser.Math.Distance.Between(clone.x, clone.y, t.x, t.y) <
                    100
                ) {
                    t.takeDamage(30, this.owner);
                }
            });

            clone.destroy();
            this._active = false;
        });
    }

    _executeDashAttack(targets) {
        // aquí código de activate/strikeFinisher
    }

    _spawnImpactEffect(x, y) {
        //código original de impacto
    }
}
