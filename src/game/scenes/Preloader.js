import { Scene } from "phaser";
import useCharacterStore from "../../store/useCharacterStore";
import { generateCharacterFrames } from "../../components/molecules/characterSVG";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        const { width, height } = this.scale;
        
        this.cameras.main.setBackgroundColor('#000000');

        const textStyle = {
            fontFamily: 'Courier New, monospace',
            fontSize: '14px',
            fill: '#00ff41',
            align: 'left'
        };

        const logoAscii = [
            "  _____          _      ",
            " / ____|        | |     ",
            "| |     ___   __| | ___ ",
            "| |    / _ \\ / _` |/ _ \\",
            "| |___| (_) | (_| |  __/",
            " \\_____\\___/ \\__,_|\\___|",
            "  ______ _       _ _    ",
            " |  ____(_)     | | |   ",
            " | |__   _  __ _| | |_  ",
            " |  __| | |/ _` | | __| ",
            " | |    | | (_| | | |_  ",
            " |_|    |_|\\__, |_|\\__| ",
            "            __/ |       ",
            "           |___/        "
        ];
        
        this.add.text(width / 2, height / 2 - 130, logoAscii, {
            ...textStyle,
            fontSize: '10px',
            align: 'center',
            fill: '#00ccff', 
            fontWeight: 'bold'
        }).setOrigin(0.5);

        const startY = height / 2 + 30;
        
        this.add.text(width / 2 - 160, startY, [
            "> CODEFIGHTERS_OS: BOOT_SEQUENCE.BAT",
            "> NEURAL_LINK: ESTABLISHED",
            "> SECURING INTEGRITY..."
        ], textStyle);

        this.fileLabel = this.add.text(width / 2 - 160, startY + 60, "> FETCHING: --", textStyle);
        
        this.pctText = this.add.text(width / 2 - 160, startY + 80, "> BUFFERING: [ 0% ]", textStyle);

        const barWidth = 320;
        const barX = width / 2 - barWidth / 2;
        const barY = height / 2 + 150;

        this.add.rectangle(width / 2, barY, barWidth, 12).setStrokeStyle(1, 0x00ff41);

        const barFill = this.add.rectangle(barX + 2, barY, 0, 8, 0x00ff41).setOrigin(0, 0.5);

        this.load.on("progress", (progress) => {
            const p = Math.round(progress * 100);
            barFill.width = (barWidth - 4) * progress;
            this.pctText.setText(`> BUFFERING: [ ${p}% ]`);
        });

        this.load.on("fileprogress", (file) => {
            this.fileLabel.setText(`> FETCHING: ${file.key.toLowerCase()}...`);
        });
    }

    preload() {
        
        this.load.setPath("assets/sound/");
        this.load.audio("menu_theme", "89.mp3");
        const characterData = useCharacterStore.getState().character;
        if (characterData) {
            try {
                const frames = generateCharacterFrames(characterData, "idle");
                const svgString = frames[0];
                const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                this.load.image("player_custom", url);                
                this.load.once("complete", () => {
                    URL.revokeObjectURL(url);
                });
            } catch (error) {
                console.error("Error cargando el SVG del personaje:", error);
            }
        }
    }

    create() {
        this.time.delayedCall(1200, () => {
            this.cameras.main.flash(400, 0, 255, 65, 0.5);
            this.cameras.main.shake(200, 0.005);

            this.time.delayedCall(400, () => {
                this.scene.start("MainMenu");
            });
        });
    }
}