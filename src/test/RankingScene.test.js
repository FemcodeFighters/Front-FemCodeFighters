import { describe, it, expect, vi, beforeEach } from "vitest";
import RankingScene from "../game/scenes/RankingScene";
import React from 'react';

describe("RankingScene Tests", () => {
    let scene;

    beforeEach(() => {
        vi.clearAllMocks();
        scene = new RankingScene();
        scene.scale = { width: 800, height: 600 };
        scene.cameras = {
            main: { fadeIn: vi.fn() },
        };
        const mockEntity = {
            setOrigin: vi.fn().mockReturnThis(),
            tilePositionX: 0,
            tilePositionY: 0,
        };
        scene.add = {
            rectangle: vi.fn(() => mockEntity),
            tileSprite: vi.fn(() => mockEntity),
            graphics: vi.fn(() => ({
                fillStyle: vi.fn(),
                fillRect: vi.fn(),
            })),
        };
        scene.make = {
            graphics: vi.fn(() => ({
                lineStyle: vi.fn(),
                strokeRect: vi.fn(),
                generateTexture: vi.fn(),
            })),
        };
    });

    it("debe crear el fondo, la rejilla y las scanlines en create()", () => {
        scene.create();
        expect(scene.add.rectangle).toHaveBeenCalledWith(
            0,
            0,
            800,
            600,
            0x020408,
        );
        expect(scene.make.graphics).toHaveBeenCalled();
        const graphicsMock = scene.make.graphics.mock.results[0].value;
        expect(graphicsMock.generateTexture).toHaveBeenCalledWith(
            "grid-pattern",
            40,
            40,
        );
        expect(scene.add.tileSprite).toHaveBeenCalledWith(
            0,
            0,
            800,
            600,
            "grid-pattern",
        );
        expect(scene.cameras.main.fadeIn).toHaveBeenCalledWith(500, 0, 0, 0);
    });

    it("debe desplazar la rejilla en cada frame (update)", () => {
        scene.create();
        scene.grid.tilePositionX = 0;
        scene.grid.tilePositionY = 0;
        scene.update();
        expect(scene.grid.tilePositionY).toBeCloseTo(-0.4);
        expect(scene.grid.tilePositionX).toBeCloseTo(-0.1);
    });
});
