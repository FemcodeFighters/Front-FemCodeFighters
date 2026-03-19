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
        const handleFocusIn = (e) => {
            if (
                e.target.tagName === "INPUT" ||
                e.target.tagName === "TEXTAREA" ||
                e.target.tagName === "SELECT" ||
                e.target.isContentEditable
            ) {
                if (game.current?.input?.keyboard) {
                    game.current.input.keyboard.enabled = false;
                }
            }
        };

        const handleFocusOut = (e) => {
            if (
                e.target.tagName === "INPUT" ||
                e.target.tagName === "TEXTAREA" ||
                e.target.tagName === "SELECT" ||
                e.target.isContentEditable
            ) {
                setTimeout(() => {
                    const active = document.activeElement;
                    const isInput =
                        active?.tagName === "INPUT" ||
                        active?.tagName === "TEXTAREA" ||
                        active?.tagName === "SELECT" ||
                        active?.isContentEditable;
                    if (!isInput && game.current?.input?.keyboard) {
                        game.current.input.keyboard.enabled = true;
                    }
                }, 50);
            }
        };

        const handleMouseDown = () => {
            const active = document.activeElement;
            const isInput =
                active?.tagName === "INPUT" ||
                active?.tagName === "TEXTAREA" ||
                active?.tagName === "SELECT";
            if (!isInput && game.current?.input?.keyboard) {
                game.current.input.keyboard.enabled = true;
            }
        };

        document.addEventListener("focusin", handleFocusIn);
        document.addEventListener("focusout", handleFocusOut);
        document.addEventListener("mousedown", handleMouseDown);

        const handleStartSolo = () => {
            const characterData = useCharacterStore.getState().character;
            if (game.current && characterData) {
                console.log("Inyectando personaje a Phaser:", characterData.ultimateSkill);
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
            if (game.current?.input?.keyboard) {
                game.current.input.keyboard.enabled = true;
            }
        });

        EventBus.on("start-solo-game", handleStartSolo);

        return () => {
            document.removeEventListener("focusin", handleFocusIn);
            document.removeEventListener("focusout", handleFocusOut);
            document.removeEventListener("mousedown", handleMouseDown);
            EventBus.off("current-scene-ready");
            EventBus.off("start-solo-game", handleStartSolo);
        };
    }, [currentActiveScene, ref]);

    return <div id="game-container"></div>;
});