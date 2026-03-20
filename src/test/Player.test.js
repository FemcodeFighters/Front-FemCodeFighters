import { describe, test, expect, vi, beforeEach } from "vitest";
import Player from "../game/characters/Player";
import { EventBus } from "../game/EventBus";
import Phaser from "phaser";
import React from 'react';
vi.mock("phaser", () => ({
    default: {
        Physics: {
            Arcade: {
                Sprite: class {
                    constructor(scene) {
                        this.scene = scene;
                        this.x = 100;
                        this.y = 100;
                        this.width = 128;
                        this.height = 128;
                        this.scaleX = 1;
                        this.scaleY = 1;
                        this.displayWidth = 120;
                        this.displayHeight = 120;
                        this.active = true;
                        this.visible = true;
                        this.flipX = false;
                        this.tintTopLeft = 0xffffff;
                        this._listeners = {};
                        this.body = {
                            setGravityY: vi.fn(),
                            setCollideWorldBounds: vi.fn(),
                            setImmovable: vi.fn(),
                            setAllowGravity: vi.fn(),
                            setMaxVelocity: vi.fn(),
                            setOffset: vi.fn(),
                            setSize: vi.fn(),
                            blocked: { down: true },
                            touching: { down: false },
                            velocity: { y: 0 },
                            enable: true,
                        };
                    }
                    setCollideWorldBounds = vi.fn();
                    setDisplaySize = vi.fn();
                    setVelocityX = vi.fn();
                    setVelocityY = vi.fn();
                    setVelocity = vi.fn();
                    setFlipX = vi.fn();
                    setScale = vi.fn();
                    setAngle = vi.fn();
                    setAlpha = vi.fn();
                    setOrigin = vi.fn();
                    setPosition = vi.fn();
                    setTint = vi.fn();
                    clearTint = vi.fn();
                    setVisible = vi.fn();
                    setDepth = vi.fn();
                    getBounds = vi.fn(() => ({
                        x: 0,
                        y: 0,
                        width: 40,
                        height: 60,
                    }));
                    play = vi.fn();
                    destroy = vi.fn();
                    emit(event, ...args) {
                        (this._listeners[event] || []).forEach((fn) =>
                            fn(...args),
                        );
                    }
                    on(event, fn) {
                        this._listeners[event] = this._listeners[event] || [];
                        this._listeners[event].push(fn);
                    }
                    get texture() {
                        return { key: "player_custom", frameTotal: 1 };
                    }
                },
            },
        },
        Math: {
            Clamp: (val, min, max) => Math.min(Math.max(val, min), max),
            Between: vi.fn(() => 0),
            Distance: { Between: vi.fn(() => 100) },
        },
        Geom: {
            Line: vi.fn(),
            Intersects: { RectangleToRectangle: vi.fn(() => false) },
        },
        Input: {
            Keyboard: {
                KeyCodes: { F: 70, G: 71, R: 82 },
                JustDown: vi.fn(() => false),
            },
        },
    },
}));

vi.mock("../game/utils/Security", () => ({
    mask: (v) => v,
    unmask: (v) => v,
}));

vi.mock("../game/characters/effects/ImpactEffect", () => ({
    default: class {
        play = vi.fn();
    },
}));

vi.mock("../game/characters/effects/SoundManager", () => ({
    soundManager: { playRangedShot: vi.fn(), playHurt: vi.fn() },
}));

vi.mock("../game/characters/Projectile", () => ({
    default: class {
        fire = vi.fn();
        active = false;
        getBounds = vi.fn();
    },
}));

vi.mock("../game/EventBus", () => ({
    EventBus: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

vi.stubGlobal("Phaser", Phaser);

const makeScene = (characterData = {}) => ({
    add: {
        existing: vi.fn(),
        circle: vi.fn(() => ({ setDepth: vi.fn(), destroy: vi.fn() })),
        rectangle: vi.fn(() => ({
            setVisible: vi.fn(),
            getBounds: vi.fn(),
            setPosition: vi.fn(),
            destroy: vi.fn(),
            setDepth: vi.fn(),
        })),
        graphics: vi.fn(() => ({
            setDepth: vi.fn(),
            fillStyle: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            closePath: vi.fn(),
            fillPath: vi.fn(),
            setPosition: vi.fn(),
            lineStyle: vi.fn(),
            strokeLineShape: vi.fn(),
            destroy: vi.fn(),
            fillRect: vi.fn(),
            generateTexture: vi.fn(),
            clear: vi.fn(),
            strokeCircle: vi.fn(),
        })),
        particles: vi.fn(() => ({
            setDepth: vi.fn().mockReturnThis(),
            explode: vi.fn(),
            destroy: vi.fn(),
            startFollow: vi.fn(),
            emitting: false,
        })),
        sprite: vi.fn(() => ({
            setOrigin: vi.fn().mockReturnThis(),
            setDisplaySize: vi.fn().mockReturnThis(),
            setAlpha: vi.fn().mockReturnThis(),
            setTint: vi.fn().mockReturnThis(),
            setFlipX: vi.fn().mockReturnThis(),
            setDepth: vi.fn().mockReturnThis(),
            active: true,
            destroy: vi.fn(),
        })),
        text: vi.fn(() => ({
            setDepth: vi.fn().mockReturnThis(),
            setAlpha: vi.fn().mockReturnThis(),
            setOrigin: vi.fn().mockReturnThis(),
            destroy: vi.fn(),
        })),
    },
    physics: {
        add: {
            existing: vi.fn(),
            group: vi.fn(() => ({ getChildren: vi.fn(() => []) })),
        },
    },
    tweens: { add: vi.fn() },
    time: {
        delayedCall: vi.fn(),
        addEvent: vi.fn(() => ({ remove: vi.fn() })),
        now: 0,
    },
    cameras: { main: { flash: vi.fn(), shake: vi.fn() } },
    anims: { exists: vi.fn(() => false) },
    textures: { exists: vi.fn(() => false) },
    make: {
        graphics: vi.fn(() => ({
            fillStyle: vi.fn(),
            fillRect: vi.fn(),
            generateTexture: vi.fn(),
            destroy: vi.fn(),
        })),
    },
    registry: {
        get: vi.fn((key) => (key === "character" ? characterData : null)),
    },
    input: {
        keyboard: {
            createCursorKeys: vi.fn(() => ({
                left: {},
                right: {},
                up: {},
                space: {},
            })),
            addKeys: vi.fn(() => ({ attack: {}, ranged: {}, ultimate: {} })),
        },
    },
    scale: { width: 800, height: 600 },
});

const makePlayer = (characterData = {}) =>
    new Player(makeScene(characterData), 100, 100);

describe("Player - lógica pura", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("se crea con la habilidad ultimate por defecto", () => {
        const p = makePlayer();
        expect(p.selectedUltimate).toBe("FRIDAY_DEPLOY");
    });

    test("usa la habilidad ultimate del characterData", () => {
        const p = makePlayer({ ultimateSkill: "GIT_CLONE" });
        expect(p.selectedUltimate).toBe("GIT_CLONE");
    });

    test("empieza con energía 0", () => {
        const p = makePlayer();
        expect(p.energy).toBe(0);
    });

    test("_gainEnergy acumula energía", () => {
        const p = makePlayer();
        p._gainEnergy(20);
        expect(p.energy).toBe(20);
    });

    test("_gainEnergy no supera maxEnergy", () => {
        const p = makePlayer();
        p._gainEnergy(9999);
        expect(p.energy).toBe(p.maxEnergy);
    });

    test("onMeleeHit gana 6 de energía", () => {
        const p = makePlayer();
        p.onMeleeHit();
        expect(p.energy).toBe(6);
    });

    test("onRangedHit gana 4 de energía", () => {
        const p = makePlayer();
        p.onRangedHit();
        expect(p.energy).toBe(4);
    });

    test("_syncWithReact emite player-ultimate", () => {
        const p = makePlayer();
        vi.clearAllMocks();
        p._syncWithReact();
        expect(EventBus.emit).toHaveBeenCalledWith(
            "player-ultimate",
            expect.objectContaining({
                energy: 0,
                max: 100,
                ready: false,
            }),
        );
    });

    test("_syncWithReact emite player-stats con hp y maxHP", () => {
        const p = makePlayer();
        vi.clearAllMocks();
        p._syncWithReact();
        expect(EventBus.emit).toHaveBeenCalledWith(
            "player-stats",
            expect.objectContaining({
                hp: expect.any(Number),
                maxHP: expect.any(Number),
            }),
        );
    });

    test("useUltimate no hace nada si no hay energía suficiente", async () => {
        const p = makePlayer();
        p.energy = 0;
        vi.clearAllMocks();
        await p.useUltimate();
        expect(EventBus.emit).not.toHaveBeenCalledWith(
            "request-ultimate",
            expect.anything(),
        );
    });

    test("useUltimate emite request-ultimate cuando hay energía", async () => {
        const p = makePlayer();
        p._gainEnergy(100);
        vi.clearAllMocks();
        await p.useUltimate();
        expect(EventBus.emit).toHaveBeenCalledWith(
            "request-ultimate",
            expect.objectContaining({
                type: "FRIDAY_DEPLOY",
            }),
        );
    });

    test("useUltimate resetea la energía a 0", async () => {
        const p = makePlayer();
        p._gainEnergy(100);
        await p.useUltimate();
        expect(p.energy).toBe(0);
    });

    test("takeDamage no hace nada si es invencible", () => {
        const p = makePlayer();
        p.isInvincible = true;
        const hpAntes = p.hp;
        p.takeDamage(50, null);
        expect(p.hp).toBe(hpAntes);
    });

    test("takeDamage emite player-damaged", () => {
        const p = makePlayer();
        p.isInvincible = false;
        vi.clearAllMocks();
        p.takeDamage(10, null);
        expect(EventBus.emit).toHaveBeenCalledWith("player-damaged");
    });
});
