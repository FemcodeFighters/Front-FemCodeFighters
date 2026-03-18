import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./game/main";
import { EventBus } from "./game/EventBus";
import useCharacterStore from "./store/useCharacterStore";

export const PhaserGame = forwardRef(function PhaserGame(
    { currentActiveScene },
    ref,
) {
    const game = useRef();
    useLayoutEffect(() => {
        if (game.current === undefined) {
            game.current = StartGame("game-container");
            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }
        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        };
    }, [ref]);

    useEffect(() => {
        const handleStartSolo = () => {
            const characterData = useCharacterStore.getState().character;
            if (game.current && characterData) {
                console.log(
                    "Inyectando personaje a Phaser:",
                    characterData.ultimateSkill,
                );
                EventBus.emit("initialize-player-data", characterData);
            }
        };
        EventBus.on("current-scene-ready", (currentScene) => {
            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            if (ref.current) {
                ref.current.scene = currentScene;
            }
        });
        EventBus.on("start-solo-game", handleStartSolo);
        return () => {
            EventBus.off("current-scene-ready");
            EventBus.off("start-solo-game", handleStartSolo);
        };
    }, [currentActiveScene, ref]);
    return <div id="game-container"></div>;
});
