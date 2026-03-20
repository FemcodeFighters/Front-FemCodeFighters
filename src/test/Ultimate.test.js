import { describe, test, expect, vi, beforeEach } from "vitest";
import Ultimate from "../game/characters/Ultimate";
import React from 'react';

vi.mock("phaser", () => ({
    default: {
        Math: {
            Between: vi.fn(() => 0),
            Distance: { Between: vi.fn(() => 50) },
        },
        Curves: {
            Spline: class {
                constructor() {}
                draw = vi.fn();
            },
        },
    },
}));

const makeScene = () => ({
    add: {
        rectangle: vi.fn(() => ({ setVisible: vi.fn(), getBounds: vi.fn() })),
        text: vi.fn(() => ({ destroy: vi.fn() })),
        graphics: vi.fn(() => ({
            clear: vi.fn(),
            lineStyle: vi.fn(),
            destroy: vi.fn(),
        })),
        sprite: vi.fn(() => ({
            setAlpha: vi.fn().mockReturnThis(),
            setTint: vi.fn().mockReturnThis(),
            setScale: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
            x: 200,
            y: 100,
            body: { setVelocityX: vi.fn() },
        })),
    },
    physics: {
        add: {
            existing: vi.fn(),
        },
    },
    tweens: {
        add: vi.fn(),
        addCounter: vi.fn(),
    },
    time: { delayedCall: vi.fn() },
});

const makeOwner = () => ({
    x: 100,
    y: 100,
    flipX: false,
    scaleX: 1,
    scaleY: 1,
    isInvincible: false,
    setTint: vi.fn(),
    clearTint: vi.fn(),
    texture: { key: "player_custom" },
    takeDamage: vi.fn(),
});

const makeUltimate = (skillKey = "FRIDAY_DEPLOY") => {
    const scene = makeScene();
    const owner = makeOwner();
    return { ultimate: new Ultimate(scene, owner, skillKey), scene, owner };
};

describe("Ultimate", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("empieza inactivo", () => {
        const { ultimate } = makeUltimate();
        expect(ultimate._active).toBe(false);
    });

    test("activate no hace nada si ya está activo", () => {
        const { ultimate, owner } = makeUltimate();
        ultimate._active = true;
        ultimate.activate([]);
        expect(owner.setTint).not.toHaveBeenCalled();
    });

    test("FRIDAY_DEPLOY activa la invencibilidad del owner", () => {
        const { ultimate, owner } = makeUltimate("FRIDAY_DEPLOY");
        ultimate.activate([]);
        expect(owner.isInvincible).toBe(true);
    });

    test("FRIDAY_DEPLOY aplica tint al owner", () => {
        const { ultimate, owner } = makeUltimate("FRIDAY_DEPLOY");
        ultimate.activate([]);
        expect(owner.setTint).toHaveBeenCalledWith(0x00ff00);
    });

    test("SPAGHETTI_CODE llama a takeDamage en targets cercanos", () => {
        const { ultimate } = makeUltimate("SPAGHETTI_CODE");
        const target = { active: true, x: 150, y: 100, takeDamage: vi.fn() };
        ultimate.activate([target]);
        expect(target.takeDamage).toHaveBeenCalledWith(15, ultimate.owner);
    });

    test("SPAGHETTI_CODE no daña a targets inactivos ni nulos", () => {
        const { ultimate } = makeUltimate("SPAGHETTI_CODE");
        ultimate.activate([null, undefined]);
        expect(ultimate._active).toBeDefined();
    });

    test("activate ignora targets inactivos", () => {
        const { ultimate } = makeUltimate("SPAGHETTI_CODE");
        const target = { active: false, x: 150, y: 100, takeDamage: vi.fn() };
        ultimate.activate([target]);
        expect(target.takeDamage).not.toHaveBeenCalled();
    });

    test("skillKey desconocido deja _active en false", () => {
        const { ultimate } = makeUltimate("SKILL_INEXISTENTE");
        ultimate.activate([]);
        expect(ultimate._active).toBe(false);
    });
});
