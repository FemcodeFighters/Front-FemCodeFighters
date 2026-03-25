import { Scene } from "phaser";
import useCharacterStore from "../../store/useCharacterStore";
import { generateCharacterFrames } from "../../components/molecules/characterSVG";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        const { width, height } = this.scale;
        this.cameras.main.setBackgroundColor("#020408");
        const gridGfx = this.add.graphics();
        gridGfx.lineStyle(1, 0x00ffc8, 0.04);
        const step = 40;
        for (let x = 0; x <= width; x += step) {
            gridGfx.beginPath();
            gridGfx.moveTo(x, 0);
            gridGfx.lineTo(x, height);
            gridGfx.strokePath();
        }
        for (let y = 0; y <= height; y += step) {
            gridGfx.beginPath();
            gridGfx.moveTo(0, y);
            gridGfx.lineTo(width, y);
            gridGfx.strokePath();
        }

        const scanGfx = this.add.graphics().setDepth(50);
        for (let y = 0; y < height; y += 4) {
            scanGfx.fillStyle(0x000000, 0.12);
            scanGfx.fillRect(0, y + 2, width, 2);
        }
        const titleY = height / 2 - 140;
        const fontStyle = {
            fontFamily: "Orbitron, monospace",
            fontSize: "88px",
            fontStyle: "900",
        };
        this.glitchR = this.add
            .text(width / 2 - 3, titleY + 2, "CODEFIGHTERS", {
                ...fontStyle,
                fill: "#ff0055",
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(10)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.glitchC = this.add
            .text(width / 2 + 3, titleY - 2, "CODEFIGHTERS", {
                ...fontStyle,
                fill: "#00ffc8",
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(11)
            .setBlendMode(Phaser.BlendModes.ADD);
        this.glitchW = this.add
            .text(width / 2, titleY, "CODEFIGHTERS", {
                ...fontStyle,
                fill: "#ffffff",
            })
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(12);
        this.noiseLine = this.add
            .rectangle(width / 2, titleY, 700, 0, 0x00ffc8, 0.15)
            .setDepth(13)
            .setAlpha(0);
        this.time.delayedCall(200, () => {
            this._glitchBurst(titleY, () => {
                this.glitchW.setAlpha(1);
                this.glitchR.setAlpha(0.6);
                this.glitchC.setAlpha(0.6);
                this._startGlitchLoop(titleY);
            });
        });
        const subtitle = this.add
            .text(
                width / 2,
                height / 2 - 52,
                "[ INITIALIZING COMBAT SYSTEM ]",
                {
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "11px",
                    fill: "#00ffc8",
                    letterSpacing: 6,
                },
            )
            .setOrigin(0.5)
            .setAlpha(0)
            .setDepth(10);
        const dividerLeft = this.add
            .rectangle(width / 2 - 5, height / 2 - 36, 0, 1, 0x00ffc8, 0.6)
            .setOrigin(1, 0.5)
            .setDepth(10);
        const dividerRight = this.add
            .rectangle(width / 2 + 5, height / 2 - 36, 0, 1, 0x00ffc8, 0.6)
            .setOrigin(0, 0.5)
            .setDepth(10);
        this.glitchLine = this.add
            .rectangle(width / 2, 100, width, 1, 0x00ffc8, 0.4)
            .setDepth(49);
        this.time.addEvent({
            delay: 3200,
            loop: true,
            callback: () => {
                this.glitchLine.y = Phaser.Math.Between(30, height - 30);
                this.glitchLine.scaleX = Phaser.Math.FloatBetween(0.3, 1);
                this.glitchLine.alpha = 0.5;
                this.tweens.add({
                    targets: this.glitchLine,
                    alpha: 0,
                    scaleX: 1,
                    duration: 180,
                    ease: "Power2",
                });
            },
        });
        const bootLines = [
            "> CODEFIGHTERS_OS v2.4.1 — BOOT SEQUENCE",
            "> NEURAL_LINK.................. [  OK  ]",
            "> COMBAT_ENGINE................ [  OK  ]",
            "> LOADING ASSETS...............",
        ];
        const logsY = height / 2 + 18;
        this.bootTexts = [];
        bootLines.forEach((line, i) => {
            const t = this.add
                .text(width / 2 - 170, logsY + i * 20, line, {
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "12px",
                    fill: i < 3 ? "#00ffc8" : "#ffffff",
                })
                .setAlpha(0)
                .setDepth(10);
            this.bootTexts.push(t);
        });
        this.fileLabel = this.add
            .text(
                width / 2 - 170,
                logsY + bootLines.length * 20 + 6,
                "> FETCHING: --",
                {
                    fontFamily: "Share Tech Mono, monospace",
                    fontSize: "11px",
                    fill: "#888888",
                },
            )
            .setAlpha(0)
            .setDepth(10);
        this.pctText = this.add
            .text(width / 2 + 60, logsY + bootLines.length * 20 + 6, "[ 0% ]", {
                fontFamily: "Share Tech Mono, monospace",
                fontSize: "11px",
                fill: "#00ffc8",
            })
            .setAlpha(0)
            .setDepth(10);
        const barWidth = 340;
        const barX = width / 2 - barWidth / 2;
        const barY = height / 2 + 163;
        this.add
            .rectangle(width / 2, barY, barWidth, 14, 0x000000)
            .setStrokeStyle(1, 0x00ffc8, 0.5)
            .setDepth(10);
        this.barFill = this.add
            .rectangle(barX + 2, barY, 0, 10, 0x00ffc8)
            .setOrigin(0, 0.5)
            .setDepth(11)
            .setAlpha(0);
        this.barGlow = this.add
            .rectangle(barX + 2, barY, 0, 10, 0xffffff, 0.2)
            .setOrigin(0, 0.5)
            .setDepth(12)
            .setAlpha(0);
        this.add
            .text(width - 16, height - 14, "v0.1.0-alpha", {
                fontFamily: "monospace",
                fontSize: "10px",
                fill: "#ffffff",
            })
            .setOrigin(1, 1)
            .setAlpha(0.15)
            .setDepth(10);
        this.load.on("progress", (progress) => {
            const p = Math.round(progress * 100);
            this.barFill.width = (barWidth - 4) * progress;
            this.barGlow.width = (barWidth - 4) * progress;
            this.pctText.setText(`[ ${p}% ]`);
        });
        this.load.on("fileprogress", (file) => {
            this.fileLabel.setText(`> FETCHING: ${file.key.toLowerCase()}...`);
        });
        this.tweens.add({
            targets: subtitle,
            alpha: 0.6,
            duration: 500,
            delay: 900,
        });
        this.tweens.add({
            targets: dividerLeft,
            width: 165,
            duration: 500,
            ease: "Power2",
            delay: 1100,
        });
        this.tweens.add({
            targets: dividerRight,
            width: 165,
            duration: 500,
            ease: "Power2",
            delay: 1100,
        });
        this.bootTexts.forEach((t, i) => {
            this.tweens.add({
                targets: t,
                alpha: i < 3 ? 0.7 : 1,
                duration: 300,
                delay: 1200 + i * 180,
            });
        });
        const afterLogs = 1200 + bootLines.length * 180 + 100;
        this.tweens.add({
            targets: this.fileLabel,
            alpha: 0.6,
            duration: 300,
            delay: afterLogs,
        });
        this.tweens.add({
            targets: this.pctText,
            alpha: 1,
            duration: 300,
            delay: afterLogs,
        });
        this.tweens.add({
            targets: this.barFill,
            alpha: 1,
            duration: 300,
            delay: afterLogs,
        });
        this.tweens.add({
            targets: this.barGlow,
            alpha: 0.2,
            duration: 300,
            delay: afterLogs,
        });
    }

    _glitchBurst(titleY, onComplete) {
        const { width } = this.scale;
        const steps = [
            {
                dx: -8,
                dy: 3,
                alphaR: 0.8,
                alphaC: 0,
                alphaW: 0,
                noiseH: 6,
                dur: 60,
            },
            {
                dx: 5,
                dy: -2,
                alphaR: 0,
                alphaC: 0.9,
                alphaW: 0,
                noiseH: 10,
                dur: 50,
            },
            {
                dx: -4,
                dy: 1,
                alphaR: 0.5,
                alphaC: 0.5,
                alphaW: 0.3,
                noiseH: 4,
                dur: 80,
            },
            {
                dx: 2,
                dy: -1,
                alphaR: 0.7,
                alphaC: 0.3,
                alphaW: 0.7,
                noiseH: 0,
                dur: 60,
            },
            {
                dx: -2,
                dy: 1,
                alphaR: 0.6,
                alphaC: 0.6,
                alphaW: 1,
                noiseH: 2,
                dur: 100,
            },
            {
                dx: 0,
                dy: 0,
                alphaR: 0.6,
                alphaC: 0.6,
                alphaW: 1,
                noiseH: 0,
                dur: 0,
            },
        ];
        let delay = 0;
        steps.forEach((s, i) => {
            this.time.delayedCall(delay, () => {
                this.glitchR
                    .setPosition(width / 2 + s.dx - 3, titleY + s.dy + 2)
                    .setAlpha(s.alphaR);
                this.glitchC
                    .setPosition(width / 2 + s.dx + 3, titleY + s.dy - 2)
                    .setAlpha(s.alphaC);
                this.glitchW
                    .setPosition(width / 2 + s.dx, titleY + s.dy)
                    .setAlpha(s.alphaW);
                this.noiseLine.y = titleY + Phaser.Math.Between(-35, 35);
                this.noiseLine.height = s.noiseH;
                this.noiseLine.alpha = s.noiseH > 0 ? 0.35 : 0;
                if (i === steps.length - 1 && onComplete) onComplete();
            });
            delay += s.dur;
        });
    }

    _startGlitchLoop(titleY) {
        const { width } = this.scale;
        const doGlitch = () => {
            const intensity = Phaser.Math.Between(1, 3);
            const frames = intensity * 2 + 2;
            let delay = 0;
            for (let i = 0; i < frames; i++) {
                const dx = Phaser.Math.Between(-intensity * 4, intensity * 4);
                const dy = Phaser.Math.Between(-intensity, intensity);
                const dur = Phaser.Math.Between(30, 80);
                this.time.delayedCall(delay, () => {
                    this.glitchR.setPosition(
                        width / 2 + dx - 3,
                        titleY + dy + 2,
                    );
                    this.glitchC.setPosition(
                        width / 2 - dx + 3,
                        titleY - dy - 2,
                    );
                    this.glitchW.setPosition(
                        width / 2 + (dx > 0 ? 1 : -1),
                        titleY + dy,
                    );
                    if (Math.random() > 0.5) {
                        this.noiseLine.y =
                            titleY + Phaser.Math.Between(-40, 40);
                        this.noiseLine.height = Phaser.Math.Between(2, 12);
                        this.noiseLine.alpha = Phaser.Math.FloatBetween(
                            0.1,
                            0.4,
                        );
                    }
                });
                delay += dur;
                if (i === frames - 1) {
                    this.time.delayedCall(delay + 40, () => {
                        this.glitchR.setPosition(width / 2 - 3, titleY + 2);
                        this.glitchC.setPosition(width / 2 + 3, titleY - 2);
                        this.glitchW.setPosition(width / 2, titleY);
                        this.noiseLine.alpha = 0;
                    });
                }
            }
            this.time.delayedCall(Phaser.Math.Between(1800, 4500), doGlitch);
        };
        this.time.delayedCall(Phaser.Math.Between(600, 1200), doGlitch);
    }

    preload() {
        this.load.setPath("assets/sound/");
        this.load.audio("menu_theme", "89.mp3");
        const characterData = useCharacterStore.getState().character;
        if (characterData) {
            try {
                const frames = generateCharacterFrames(characterData, "idle");
                const blob = new Blob([frames[0]], {
                    type: "image/svg+xml;charset=utf-8",
                });
                const url = URL.createObjectURL(blob);
                this.load.image("player_custom", url);
                this.load.once("complete", () => URL.revokeObjectURL(url));
            } catch (error) {
                console.error("Error cargando el SVG del personaje:", error);
            }
        }
    }

    create() {
        this.barFill.width = 336;
        this.barGlow.width = 336;
        this.pctText.setText("[ 100% ]");
        this.fileLabel.setText("> FETCHING: complete");
        this.time.delayedCall(600, () => {
            this._glitchBurst(this.scale.height / 2 - 140, () => {
                this.cameras.main.flash(400, 0, 255, 200, 0.6);
                this.cameras.main.shake(250, 0.006);
                this.time.delayedCall(400, () => this.scene.start("MainMenu"));
            });
        });
    }
}
