// Efecto de impacto estilo anime — estrellas, anillos y flash

export default class ImpactEffect {
    constructor(scene) {
        this.scene = scene;
    }

    play(x, y) {
        this._flash(x, y);
        this._rings(x, y);
        this._lines(x, y);
        this._stars(x, y);
    }

    // ── Flash central ─────────────────────────────────────────────────────
    _flash(x, y) {
        const flash = this.scene.add.circle(x, y, 40, 0xffffff, 0.9);
        flash.setDepth(20);
        this.scene.tweens.add({
            targets:  flash,
            alpha:    0,
            scaleX:   2.5,
            scaleY:   2.5,
            duration: 180,
            ease:     'Power2',
            onComplete: () => flash.destroy(),
        });

        const glow = this.scene.add.circle(x, y, 30, 0xa855f7, 0.6);
        glow.setDepth(19);
        this.scene.tweens.add({
            targets:  glow,
            alpha:    0,
            scaleX:   3,
            scaleY:   3,
            duration: 250,
            ease:     'Power2',
            onComplete: () => glow.destroy(),
        });
    }

    // ── Anillos expansivos ────────────────────────────────────────────────
    _rings(x, y) {
        const colors = [0x7c3aed, 0x00ffc8];
        colors.forEach((color, i) => {
            const ring = this.scene.add.circle(x, y, 8, color, 0);
            ring.setStrokeStyle(2.5, color, 0.9);
            ring.setDepth(18);
            this.scene.tweens.add({
                targets:  ring,
                scaleX:   6 + i,
                scaleY:   6 + i,
                alpha:    0,
                duration: 300 + i * 80,
                delay:    i * 40,
                ease:     'Power2',
                onComplete: () => ring.destroy(),
            });
        });
    }

    // ── Líneas de impacto ─────────────────────────────────────────────────
    _lines(x, y) {
        const count  = 8;
        const colors = [0xffffff, 0x7c3aed, 0x00ffc8];
        for (let i = 0; i < count; i++) {
            const angle  = (i / count) * Math.PI * 2;
            const color  = colors[i % colors.length];
            const length = 30 + Math.random() * 25;
            const line   = this.scene.add.graphics();
            line.setDepth(17);

            const startDist = 10;
            const x1 = x + Math.cos(angle) * startDist;
            const y1 = y + Math.sin(angle) * startDist;
            const x2 = x + Math.cos(angle) * (startDist + length);
            const y2 = y + Math.sin(angle) * (startDist + length);

            line.lineStyle(2, color, 1);
            line.strokeLineShape(new Phaser.Geom.Line(x1, y1, x2, y2));

            this.scene.tweens.add({
                targets:  line,
                alpha:    0,
                duration: 250,
                delay:    20,
                onComplete: () => line.destroy(),
            });
        }
    }

    // ── Estrellas de 8 puntas ─────────────────────────────────────────────
    _stars(x, y) {
        const count  = 10;
        const colors = [0xffffff, 0x7c3aed, 0xa855f7, 0xe879f9, 0x00ffc8];

        for (let i = 0; i < count; i++) {
            const angle  = Math.random() * Math.PI * 2;
            const speed  = 80 + Math.random() * 160;
            const size   = 5 + Math.random() * 10;
            const color  = colors[Math.floor(Math.random() * colors.length)];
            const star   = this._createStar(x, y, size, color);

            this.scene.tweens.add({
                targets:  star,
                x:        x + Math.cos(angle) * speed,
                y:        y + Math.sin(angle) * speed,
                scaleX:   0.1,
                scaleY:   0.1,
                alpha:    0,
                angle:    star.angle + Phaser.Math.Between(-180, 180),
                duration: 350 + Math.random() * 200,
                ease:     'Power2',
                onComplete: () => star.destroy(),
            });
        }
    }

    _createStar(x, y, size, color) {
        const g = this.scene.add.graphics();
        g.setDepth(21);
        g.fillStyle(color, 1);
        g.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const r     = i % 2 === 0 ? size : size * 0.4;
            const px    = Math.cos(angle) * r;
            const py    = Math.sin(angle) * r;
            i === 0 ? g.moveTo(px, py) : g.lineTo(px, py);
        }
        g.closePath();
        g.fillPath();
        g.setPosition(x, y);
        return g;
    }
}
