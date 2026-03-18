import { Scene } from "phaser";
import { EventBus } from "../EventBus";

export class GameOver extends Scene {
    constructor() {
        super("GameOver");
    }

    init(data) {
        this.winner = data.winner || "enemy";
    }

    create() {
        const { width, height } = this.scale;
        EventBus.emit("combat-result", { winner: this.winner });
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);
        const isWin = this.winner === "player";
        const titleText = isWin ? "MISSION ACCOMPLISHED" : "SYSTEM FAILURE";
        const titleColor = isWin ? "#00ffff" : "#ff0055";
        this.add
            .text(width / 2, height / 2 - 50, titleText, {
                fontFamily: "Orbitron, Courier",
                fontSize: "64px",
                fill: titleColor,
                stroke: "#000",
                strokeThickness: 6,
            })
            .setOrigin(0.5);

        const retryBtn = this.add
            .text(width / 2, height / 2 + 100, "PRESS [R] TO RESTART", {
                fontFamily: "Courier",
                fontSize: "24px",
                fill: "#ffff00",
            })
            .setOrigin(0.5);

        this.tweens.add({
            targets: retryBtn,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
        });

        this.input.keyboard.once("keydown-R", () => {
            this.scene.stop("GameOver");
            this.scene.start("CombatScene");
        });

        this.input.keyboard.once("keydown-ESC", () => {
            this.scene.stop("GameOver");
            this.scene.start("MainMenu");
        });
    }
}

