/**
 * Ultimate.js
 * Dash + golpe devastador al final del recorrido.
 * Se activa desde Player.js con la tecla R cuando la barra está llena.
 */
import Phaser from 'phaser';

export default class Ultimate {
    constructor(scene, owner) {
        this.scene  = scene;
        this.owner  = owner;

        this.damage      = 50;    // daño del golpe final
        this.dashSpeed   = 900;   // velocidad del dash
        this.dashDuration = 250;  // ms que dura el dash
        this.hitRange    = 120;   // rango del golpe al terminar el dash

        this._active = false;

        // Hitbox del golpe final
        this._hitbox = scene.add.rectangle(0, 0, this.hitRange, 80, 0xff00ff, 0);
        scene.physics.add.existing(this._hitbox, true);
        this._hitbox.setVisible(false);

        // Trail visual del dash
        this._trail = [];
    }

    // ─────────────────────────────────────────────────────────────────────
    // ACTIVAR
    // ─────────────────────────────────────────────────────────────────────
    activate(targets) {
        if (this._active) return;
        this._active = true;

        const direction = this.owner.facingRight ? 1 : -1;

        // Bloquear input del owner durante el dash
        this.owner.isInvincible = true;

        // Velocidad del dash
        this.owner.setVelocityX(this.dashSpeed * direction);
        this.owner.setVelocityY(-150); // pequeño salto hacia arriba

        // Trail de rectángulos que se desvanecen
        this._spawnTrail();

        // Al terminar el dash → golpe devastador
        this.scene.time.delayedCall(this.dashDuration, () => {
            this.owner.setVelocityX(0);
            this._strikeFinisher(targets, direction);
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    // GOLPE FINAL
    // ─────────────────────────────────────────────────────────────────────
    _strikeFinisher(targets, direction) {
        // Posicionar hitbox delante del owner
        const hx = this.owner.x + direction * (this.hitRange / 2 + 20);
        this._hitbox.setPosition(hx, this.owner.y);

        // Flash blanco en el owner
        this.scene.tweens.add({
            targets:  this.owner,
            alpha:    { from: 1, to: 0.1 },
            duration: 60,
            yoyo:     true,
            repeat:   2,
        });

        // Comprobar impacto contra cada target
        const hitBounds = this._hitbox.getBounds();
        targets.forEach(target => {
            if (!target || !target.isAlive()) return;
            if (Phaser.Geom.Intersects.RectangleToRectangle(hitBounds, target.getBounds())) {
                target.takeDamage(this.damage, this.owner);
                // Knockback extra
                const kb = target.x > this.owner.x ? 1 : -1;
                target.setVelocity(kb * 400, -350);
            }
        });

        // Efecto visual de impacto
        this._spawnImpactEffect(hx, this.owner.y);

        // Restaurar owner
        this.scene.time.delayedCall(200, () => {
            this.owner.isInvincible = false;
            this._active = false;
        });
    }

    // ─────────────────────────────────────────────────────────────────────
    // EFECTOS VISUALES
    // ─────────────────────────────────────────────────────────────────────
    _spawnTrail() {
        const colors = [0xcc00ff, 0x9900cc, 0x6600aa];
        let delay = 0;

        for (let i = 0; i < 6; i++) {
            delay += 30;
            this.scene.time.delayedCall(delay, () => {
                const rect = this.scene.add.rectangle(
                    this.owner.x, this.owner.y,
                    this.owner.width * 0.8,
                    this.owner.height * 0.8,
                    colors[i % colors.length], 0.5
                );
                this.scene.tweens.add({
                    targets:  rect,
                    alpha:    0,
                    duration: 300,
                    onComplete: () => rect.destroy(),
                });
            });
        }
    }

    _spawnImpactEffect(x, y) {
        // Círculo expansivo de impacto
        const circle = this.scene.add.circle(x, y, 10, 0xff00ff, 0.8);
        this.scene.tweens.add({
            targets:  circle,
            scaleX:   8,
            scaleY:   8,
            alpha:    0,
            duration: 350,
            ease:     'Power2',
            onComplete: () => circle.destroy(),
        });

        // Partículas simples (rectángulos pequeños)
        for (let i = 0; i < 8; i++) {
            const angle  = (i / 8) * Math.PI * 2;
            const speed  = Phaser.Math.Between(80, 160);
            const px     = x + Math.cos(angle) * 10;
            const py     = y + Math.sin(angle) * 10;
            const p      = this.scene.add.rectangle(px, py, 6, 6, 0xff66ff, 1);

            this.scene.tweens.add({
                targets:  p,
                x:        px + Math.cos(angle) * speed,
                y:        py + Math.sin(angle) * speed,
                alpha:    0,
                duration: 400,
                ease:     'Power1',
                onComplete: () => p.destroy(),
            });
        }
    }

    destroy() {
        this._hitbox?.destroy();
    }
}
