import { Boot } from "./scenes/Boot";
import { GameOver } from "./scenes/GameOver";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import CombatScene from "./scenes/CombatScene";
import RankingScene from "./scenes/RankingScene";
import Phaser from "phaser";

const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: "game-container",
    backgroundColor: "#1a1a2e",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 600 },
            debug: false,
        },
    },
    audio: {
        disableWebAudio: false,
        noAudio: false,
        context: undefined,
    },
    scene: [Boot, Preloader, MainMenu, CombatScene, GameOver, RankingScene],
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;
