import { describe, it, expect, vi, beforeEach } from "vitest";
import React from 'react';
vi.mock("../game/scenes/Boot", () => ({ Boot: { name: "Boot" } }));
vi.mock("../game/scenes/Preloader", () => ({
    Preloader: { name: "Preloader" },
}));
vi.mock("../game/scenes/MainMenu", () => ({ MainMenu: { name: "MainMenu" } }));
vi.mock("../game/scenes/CombatScene", () => ({
    default: { name: "CombatScene" },
}));
vi.mock("../game/scenes/GameOver", () => ({ GameOver: { name: "GameOver" } }));
vi.mock("../game/scenes/RankingScene", () => ({
    default: { name: "RankingScene" },
}));

vi.mock("phaser", () => {
    const GameMock = function (config) {
        return config;
    };

    return {
        default: {
            Game: GameMock,
            AUTO: 0,
            Scale: { RESIZE: 1, CENTER_BOTH: 2 },
            Events: { EventEmitter: vi.fn() },
        },
        Game: GameMock,
        AUTO: 0,
        Scale: { RESIZE: 1, CENTER_BOTH: 2 },
        Scene: class {},
    };
});

import StartGame from "../game/main";
describe("Game Entry Point (main.js)", () => {
    beforeEach(() => {
        global.window = {
            innerWidth: 1280,
            innerHeight: 720,
        };
    });

    it("debe configurar correctamente el objeto Phaser.Game", () => {
        const parentId = "game-container";
        const config = StartGame(parentId);
        expect(config).toBeDefined();
        expect(config.parent).toBe(parentId);
        expect(config.physics.default).toBe("arcade");
        expect(config.physics.arcade.gravity.y).toBe(600);
        const sceneNames = config.scene.map((s) => s.name);
        expect(sceneNames).toContain("Boot");
        expect(sceneNames).toContain("Preloader");
        expect(sceneNames).toContain("CombatScene");
        expect(sceneNames).toContain("RankingScene");
    });

    it("debe activar el centrado automático en el escalado", () => {
        const config = StartGame("test-id");
        expect(config.scale.autoCenter).toBe(2);
    });
});
