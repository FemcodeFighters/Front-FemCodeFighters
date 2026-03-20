import { describe, it, expect, vi, beforeEach } from "vitest";
import { Preloader } from "../game/scenes/Preloader";
import React from 'react';

vi.mock("../store/useCharacterStore", () => ({
    default: {
        getState: vi.fn(() => ({ character: { id: 1, name: "Tester" } })),
    },
}));

vi.mock("../../components/molecules/characterSVG", () => ({
    generateCharacterFrames: vi.fn(() => ["<svg></svg>"]),
}));

describe("Preloader Scene Tests", () => {
    let scene;

    beforeEach(() => {
        vi.clearAllMocks();

        global.Phaser = {
            BlendModes: { ADD: 1 },
            Math: {
                Between: vi.fn((a, b) => a),
                FloatBetween: vi.fn((a, b) => a),
            },
        };

        scene = new Preloader();
        scene.scale = { width: 800, height: 600 };
        scene.cameras = {
            main: {
                setBackgroundColor: vi.fn(),
                flash: vi.fn(),
                shake: vi.fn(),
            },
        };

        const createMockEntity = () => ({
            setOrigin: vi.fn().mockReturnThis(),
            setAlpha: vi.fn().mockReturnThis(),
            setDepth: vi.fn().mockReturnThis(),
            setBlendMode: vi.fn().mockReturnThis(),
            setPosition: vi.fn().mockReturnThis(),
            setStrokeStyle: vi.fn().mockReturnThis(),
            setText: vi.fn().mockReturnThis(),
            setScale: vi.fn().mockReturnThis(),
            width: 0,
            height: 0,
            y: 0,
            alpha: 0,
        });

        scene.add = {
            graphics: vi.fn(() => ({
                lineStyle: vi.fn().mockReturnThis(),
                beginPath: vi.fn().mockReturnThis(),
                moveTo: vi.fn().mockReturnThis(),
                lineTo: vi.fn().mockReturnThis(),
                strokePath: vi.fn().mockReturnThis(),
                fillStyle: vi.fn().mockReturnThis(),
                fillRect: vi.fn().mockReturnThis(),
                setDepth: vi.fn().mockReturnThis(),
            })),
            text: vi.fn(() => createMockEntity()),
            rectangle: vi.fn(() => createMockEntity()),
        };

        scene.load = {
            setPath: vi.fn().mockReturnThis(),
            audio: vi.fn().mockReturnThis(),
            image: vi.fn().mockReturnThis(),
            on: vi.fn(),
            once: vi.fn(),
        };
        scene.time = {
            delayedCall: vi.fn((ms, cb) => {
                if (ms < 1000) cb();
                return { remove: vi.fn() };
            }),
            addEvent: vi.fn(),
        };

        scene.tweens = { add: vi.fn() };
        scene.scene = { start: vi.fn() };

        global.URL.createObjectURL = vi.fn(() => "blob:url");
        global.URL.revokeObjectURL = vi.fn();
        global.Blob = vi.fn();
    });

    it("debe configurar la barra de progreso y los textos de glitch en init()", () => {
        scene.init();
        expect(scene.load.on).toHaveBeenCalledWith(
            "progress",
            expect.any(Function),
        );
        expect(scene.add.text).toHaveBeenCalledWith(
            expect.any(Number),
            expect.any(Number),
            "CODEFIGHTERS",
            expect.any(Object),
        );
    });

    it("debe actualizar visualmente la barra al recibir progreso de carga", () => {
        scene.init();
        const progressCall = vi
            .mocked(scene.load.on)
            .mock.calls.find((call) => call[0] === "progress");
        progressCall[1](0.5);

        expect(scene.pctText.setText).toHaveBeenCalledWith("[ 50% ]");
        expect(scene.barFill.width).toBe(168);
    });

    it("debe cargar el audio y el personaje custom en preload()", () => {
        scene.preload();
        expect(scene.load.audio).toHaveBeenCalledWith("menu_theme", "89.mp3");
    });

    it("debe finalizar la carga con éxito y saltar a MainMenu en create()", () => {
        scene.init();
        scene.create();
        expect(scene.pctText.setText).toHaveBeenCalledWith("[ 100% ]");
        expect(scene.scene.start).toHaveBeenCalledWith("MainMenu");
    });
});
