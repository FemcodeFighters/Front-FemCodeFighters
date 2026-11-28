import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import useCharacterStore from "../../store/useCharacterStore";
import { generateCharacterFrames } from "../../components/molecules/characterSVG";
import { addSvgTexture } from "../utils/svgTexture";

export class MainMenu extends Scene {
    constructor() {
        super("MainMenu");
        this.updateCounter = 0;
        this.isChangingScene = false;
        this.menuMusic = null;
    }

    create() {
        this.isChangingScene = false;
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x020408);
        if (this.cache.audio.exists("menu_theme")) {
            this.menuMusic = this.sound.add("menu_theme", {
                loop: true,
                volume: 0.5,
            });
            console.log("Música de menú preparada.");
        }

        const startMusic = () => {
            if (!this.sound || !this.sound.context) return;
            if (this.sound.context.state === "suspended") {
                this.sound.context.resume();
            }
            if (!this.menuMusic) return;
            if (this.sound.context.state !== "running") {
                this.sound.context.resume().then(() => {
                    if (!this.menuMusic.isPlaying) {
                        this.menuMusic.play();
                        console.log("¡Audio desbloqueado!");
                    }
                });
            } else {
                if (!this.menuMusic.isPlaying) this.menuMusic.play();
            }
        };
        EventBus.on("user-interacted", startMusic);
        EventBus.on("start-solo-game", () => {
            console.log("Iniciando partida solo...");
            startMusic();
            this.changeScene();
        });
        const onUpdate = (data) => this.updatePlayerAnimation(data);
        EventBus.on("character-data-updated", onUpdate);
        this.input.once("pointerdown", startMusic);
        this.player = this.add
            .sprite(width / 2, height / 2 + 50, "")
            .setScale(2);
        this.events.on("shutdown", () => {
            EventBus.off("user-interacted", startMusic);
            EventBus.off("start-solo-game");
            EventBus.off("character-data-updated", onUpdate);
            if (this.menuMusic) {
                this.tweens.add({
                    targets: this.menuMusic,
                    volume: 0,
                    duration: 400,
                    onComplete: () => {
                        if (this.menuMusic) this.menuMusic.stop();
                    },
                });
            }
        });
        const initialCharacter = useCharacterStore.getState().character;
        if (initialCharacter) {
            this.updatePlayerAnimation(initialCharacter);
        }
        EventBus.emit("current-scene-ready", this);
    }

   async updatePlayerAnimation(characterData) {
    this.updateCounter++;
    const currentBatchId = this.updateCounter;
    const framesSVG = generateCharacterFrames(characterData, "idle");
    const frameKeys = framesSVG.map(
        (_, index) => `p_${currentBatchId}_${index}`,
    );
    await Promise.all(
        framesSVG.map((svg, index) =>
            addSvgTexture(this, frameKeys[index], svg),
        ),
    );
    if (currentBatchId !== this.updateCounter) return;
    const animKey = `idle_${currentBatchId}`;
    this.anims.create({
        key: animKey,
        frames: frameKeys.map((key) => ({ key })),
        frameRate: 6,
        repeat: -1,
    });
    this.player.play(animKey);
}

    changeScene() {
        if (this.isChangingScene) return;
        this.isChangingScene = true;
        if (!this.cameras || !this.cameras.main) {
            this.scene.start("CombatScene");
            return;
        }
        EventBus.emit("main-menu-leave");
        this.cameras.main.fade(400, 0, 0, 0);
        this.time.delayedCall(450, () => {
            this.scene.start("CombatScene");
        });
    }
}
