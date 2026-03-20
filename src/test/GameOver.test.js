import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameOver } from "../game/scenes/GameOver";
import { EventBus } from "../game/EventBus";
import React from 'react';
vi.mock("../game/EventBus", () => ({
    EventBus: { emit: vi.fn() },
}));

describe("GameOver Scene Tests", () => {
    let scene;

    beforeEach(() => {
        vi.clearAllMocks();
        scene = new GameOver();

        scene.scale = { width: 800, height: 600 };

        const mockEntity = { setOrigin: vi.fn().mockReturnThis() };
        scene.add = {
            rectangle: vi.fn(() => mockEntity),
            text: vi.fn(() => mockEntity),
        };

        scene.tweens = { add: vi.fn() };

        scene.scene = {
            stop: vi.fn(),
            start: vi.fn(),
        };

        scene.input = {
            keyboard: {
                once: vi.fn(),
            },
        };
    });

    it("debe emitir el resultado de victoria y mostrar el texto correcto", () => {
        scene.init({ winner: "player" });
        scene.create();

        expect(EventBus.emit).toHaveBeenCalledWith("combat-result", {
            winner: "player",
        });

        const textCall = scene.add.text.mock.calls.find(
            (call) => call[2] === "MISSION ACCOMPLISHED",
        );
        expect(textCall).toBeDefined();
        expect(textCall[3].fill).toBe("#00ffff");
    });

    it("debe mostrar el texto de fallo cuando el enemigo gana", () => {
        scene.init({ winner: "enemy" });
        scene.create();

        const textCall = scene.add.text.mock.calls.find(
            (call) => call[2] === "SYSTEM FAILURE",
        );
        expect(textCall).toBeDefined();
        expect(textCall[3].fill).toBe("#ff0055");
    });

    it("debe reiniciar el combate al pulsar la tecla R", () => {
        scene.init({ winner: "player" });
        scene.create();

        const rHandlerCall = scene.input.keyboard.once.mock.calls.find(
            (call) => call[0] === "keydown-R",
        );
        const rCallback = rHandlerCall[1];

        rCallback();

        expect(scene.scene.stop).toHaveBeenCalledWith("GameOver");
        expect(scene.scene.start).toHaveBeenCalledWith("CombatScene");
    });

    it("debe volver al MainMenu al pulsar la tecla ESC", () => {
        scene.init({ winner: "player" });
        scene.create();

        const escHandlerCall = scene.input.keyboard.once.mock.calls.find(
            (call) => call[0] === "keydown-ESC",
        );
        const escCallback = escHandlerCall[1];

        escCallback();

        expect(scene.scene.stop).toHaveBeenCalledWith("GameOver");
        expect(scene.scene.start).toHaveBeenCalledWith("MainMenu");
    });
});
