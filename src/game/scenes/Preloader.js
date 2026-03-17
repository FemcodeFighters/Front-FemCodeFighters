import { Scene } from "phaser";
import useCharacterStore from "../../store/useCharacterStore";
import { generateCharacterFrames } from "../../components/molecules/characterSVG";

export class Preloader extends Scene {
    constructor() {
        super("Preloader");
    }

    init() {
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);
        this.add
            .rectangle(width / 2, height / 2, 468, 32)
            .setStrokeStyle(1, 0x7c3aed);
        const bar = this.add.rectangle(
            width / 2 - 230,
            height / 2,
            4,
            28,
            0x7c3aed,
        );
        this.load.on("progress", (progress) => {
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        this.load.setPath("assets/sound/");
        this.load.audio("menu_theme", "89.mp3");
        const characterData = useCharacterStore.getState().character;

        if (characterData) {
            const frames = generateCharacterFrames(characterData, "idle");
            const svgString = frames[0];
            const blob = new Blob([svgString], {
                type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            this.load.image("player_custom", url);
            this.load.once("complete", () => {
                URL.revokeObjectURL(url);
            });
        }
    }

    create() {
        this.scene.start("MainMenu");
    }
}
