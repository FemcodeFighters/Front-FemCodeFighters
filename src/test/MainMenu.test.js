import { describe, it, expect, vi, beforeEach } from "vitest";
import { MainMenu } from "../game/scenes/MainMenu";
import { EventBus } from "../game/EventBus";
import useCharacterStore from "../store/useCharacterStore";
import React from 'react';
vi.mock("../game/EventBus", () => ({
    EventBus: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
    },
}));

vi.mock("../store/useCharacterStore", () => ({
    default: {
        getState: vi.fn(() => ({
            character: { id: 1, name: "Default" },
        })),
    },
}));

vi.mock("../../components/molecules/characterSVG", () => ({
    generateCharacterFrames: vi.fn(() => ["<svg></svg>"]),
}));

describe("MainMenu Scene Tests", () => {
    let scene;

    beforeEach(() => {
        vi.clearAllMocks();
        scene = new MainMenu();
        scene.scale = { width: 800, height: 600 };
        scene.add = {
            rectangle: vi.fn().mockReturnThis(),
            sprite: vi.fn(() => ({
                setScale: vi.fn().mockReturnThis(),
                play: vi.fn(),
            })),
        };

        scene.cache = { audio: { exists: vi.fn().mockReturnValue(true) } };
        scene.sound = {
            add: vi.fn(() => ({
                play: vi.fn(),
                isPlaying: false,
                stop: vi.fn(),
            })),
            context: {
                state: "suspended",
                resume: vi.fn().mockResolvedValue(),
            },
        };
        scene.input = { once: vi.fn() };
        scene.cameras = { main: { fade: vi.fn() } };
        scene.time = { delayedCall: vi.fn((ms, cb) => cb()) };
        scene.scene = { start: vi.fn() };
        scene.events = { on: vi.fn() };
        scene.anims = { create: vi.fn() };
        scene.textures = { addImage: vi.fn() };
        scene.tweens = { add: vi.fn() };
        global.URL.createObjectURL = vi.fn(() => "blob:url");
        global.URL.revokeObjectURL = vi.fn();
        global.Image = class {
            constructor() {
                setTimeout(() => {
                    if (this.onload) this.onload();
                }, 1);
            }
        };
    });
    it("debe inicializarse con el personaje del Store", () => {
        scene.create();
        expect(vi.mocked(useCharacterStore.getState)).toHaveBeenCalled();
        expect(EventBus.emit).toHaveBeenCalledWith(
            "current-scene-ready",
            scene,
        );
    });
    it("debe registrar y desregistrar eventos del EventBus correctamente", () => {
        scene.create();
        expect(EventBus.on).toHaveBeenCalledWith(
            "user-interacted",
            expect.any(Function),
        );
        expect(EventBus.on).toHaveBeenCalledWith(
            "start-solo-game",
            expect.any(Function),
        );
        const shutdownCall = scene.events.on.mock.calls.find(
            (call) => call[0] === "shutdown",
        );
        const shutdownCallback = shutdownCall[1];
        shutdownCallback();
        expect(EventBus.off).toHaveBeenCalledWith(
            "user-interacted",
            expect.any(Function),
        );
    });
    it("debe iniciar la transición a CombatScene cuando recibe start-solo-game", () => {
        scene.create();
        const startSoloCall = vi
            .mocked(EventBus.on)
            .mock.calls.find((call) => call[0] === "start-solo-game");
        const startSoloCallback = startSoloCall[1];
        startSoloCallback();
        expect(scene.cameras.main.fade).toHaveBeenCalled();
        expect(scene.scene.start).toHaveBeenCalledWith("CombatScene");
    });
    it("debe crear animaciones dinámicas al recibir nuevos datos de personaje", async () => {
        const mockSprite = {
            play: vi.fn(),
            setScale: vi.fn().mockReturnThis(),
        };
        scene.player = mockSprite;
        await scene.updatePlayerAnimation({ color: "red" });
        expect(scene.anims.create).toHaveBeenCalledWith(
            expect.objectContaining({
                key: expect.stringContaining("idle_"),
                frameRate: 6,
            }),
        );
        expect(mockSprite.play).toHaveBeenCalledWith(
            expect.stringContaining("idle_"),
        );
    });
});
