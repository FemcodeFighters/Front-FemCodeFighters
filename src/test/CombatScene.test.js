import { describe, it, expect, vi, beforeEach } from "vitest";
import CombatScene from "../game/scenes/CombatScene";
import { EventBus } from "../game/EventBus";
import * as playerApi from "../service/playerApi";
import React from 'react';

vi.mock("../game/EventBus", () => ({
    EventBus: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

vi.mock("../service/playerApi", () => ({
    getCharacter: vi.fn(),
    getUltimateConfig: vi.fn(),
}));

vi.mock("../../components/molecules/characterSVG", () => ({
    generateCharacterFrames: vi.fn(() => ["<svg></svg>"]),
}));

vi.mock("../../components/molecules/enemySVG", () => ({
    loadEnemyTextures: vi.fn(),
}));

describe("CombatScene Unit Tests", () => {
    let scene;

    const graphicMethods = [
        "clear",
        "fillStyle",
        "fillRect",
        "lineStyle",
        "strokeRect",
        "beginPath",
        "moveTo",
        "lineTo",
        "strokePath",
        "closePath",
        "strokeLineShape",
        "fillEllipse",
        "fillTriangle",
        "fillCircle",
        "generateTexture",
        "destroy",
        "setDepth",
        "setAlpha",
        "setVisible",
        "setOrigin",
        "setScale",
        "setTint",
        "clearTint",
        "on",
        "once",
        "emit",
        "setPosition",
        "setActive",
        "play",
        "setCollideWorldBounds",
        "setDisplaySize",
        "setFlipX",
        "setAngle",
        "setSmoothing",
    ];

    const setupMockEntity = (obj = {}) => {
        graphicMethods.forEach((m) => (obj[m] = vi.fn().mockReturnThis()));
        obj.body = {
            setGravityY: vi.fn().mockReturnThis(),
            setCollideWorldBounds: vi.fn().mockReturnThis(),
            setImmovable: vi.fn().mockReturnThis(),
            setAllowGravity: vi.fn().mockReturnThis(),
            setMaxVelocity: vi.fn().mockReturnThis(),
            setSize: vi.fn().mockReturnThis(),
            setOffset: vi.fn().mockReturnThis(),
            setVelocity: vi.fn().mockReturnThis(),
            stop: vi.fn().mockReturnThis(),
        };
        return obj;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        scene = new CombatScene();

        scene.enemyQueue = [
            { name: "Bug 1", hp: 100, maxHP: 100, enemyType: "BUG" },
            { name: "Bug 2", hp: 100, maxHP: 100, enemyType: "GLITCH" },
        ];
        scene.currentEnemyIndex = 0;
        scene.combatFinished = false;

        scene.physics = {
            pause: vi.fn(),
            resume: vi.fn(),
            add: {
                staticGroup: vi.fn(() => ({
                    add: vi.fn(),
                    create: vi.fn(() => setupMockEntity({})),
                })),
                group: vi.fn(() => ({
                    add: vi.fn(),
                    create: vi.fn(() => setupMockEntity({})),
                    setDepth: vi.fn().mockReturnThis(),
                })),
                collider: vi.fn(),
                overlap: vi.fn(),
                existing: vi.fn(),
            },
        };

        scene.scale = { width: 800, height: 600 };
        scene.cameras = {
            main: {
                setBackgroundColor: vi.fn().mockReturnThis(),
                fadeIn: vi.fn(),
                flash: vi.fn(),
                shake: vi.fn(),
                scrollX: 0,
                scrollY: 0,
            },
        };

        scene.add = {
            existing: vi.fn((obj) => setupMockEntity(obj)),
            rectangle: vi.fn(() => setupMockEntity({})),
            text: vi.fn(() => setupMockEntity({})),
            graphics: vi.fn(() => setupMockEntity({})),
            particles: vi.fn(() => ({
                setDepth: vi.fn().mockReturnThis(),
                stop: vi.fn().mockReturnThis(),
                startFollow: vi.fn().mockReturnThis(),
                setAlpha: vi.fn().mockReturnThis(),
                emitParticleAt: vi.fn().mockReturnThis(),
                setFrequency: vi.fn().mockReturnThis(),
                setConfig: vi.fn().mockReturnThis(),
            })),
        };

        scene.input = {
            keyboard: {
                createCursorKeys: vi.fn(() => ({
                    up: {},
                    down: {},
                    left: {},
                    right: {},
                    space: {},
                    shift: {},
                })),
                addKey: vi.fn(() => ({ isDown: false })),
                addKeys: vi.fn(() => ({
                    W: {},
                    A: {},
                    S: {},
                    D: {},
                    UP: {},
                    LEFT: {},
                    DOWN: {},
                    RIGHT: {},
                })),
                on: vi.fn().mockReturnThis(),
                removeListener: vi.fn().mockReturnThis(),
            },
        };

        scene.make = { graphics: vi.fn(() => setupMockEntity({})) };
        scene.textures = {
            exists: vi.fn().mockReturnValue(true),
            remove: vi.fn(),
            generateTexture: vi.fn(),
        };
        scene.tweens = { add: vi.fn() };
        scene.time = {
            delayedCall: vi.fn((ms, cb) => cb()),
            addEvent: vi.fn(),
        };
        scene.events = { emit: vi.fn(), on: vi.fn(), once: vi.fn() };
        scene.registry = { set: vi.fn(), get: vi.fn().mockReturnValue({}) };
        scene.load = {
            image: vi.fn(),
            once: vi.fn((evt, cb) => cb()),
            start: vi.fn(),
        };

        global.URL.createObjectURL = vi.fn(() => "blob:url");
    });

    it("debe cargar los datos del personaje y emitir el nombre en _initEntities", async () => {
        vi.mocked(playerApi.getCharacter).mockResolvedValue({
            username: "Tester",
        });
        vi.mocked(playerApi.getUltimateConfig).mockResolvedValue({});

        await scene._initEntities(800, 600);
        expect(EventBus.emit).toHaveBeenCalledWith("player-name", {
            name: "Tester",
        });
    });

    it("debe reaccionar al evento de habilidad definitiva del jugador", async () => {
        vi.mocked(playerApi.getCharacter).mockResolvedValue({
            username: "Tester",
        });
        vi.mocked(playerApi.getUltimateConfig).mockResolvedValue({});

        await scene.create();

        const calls = vi.mocked(EventBus.on).mock.calls;
        const callback = calls.find(
            (call) => call[0] === "player-ultimate-executed",
        )[1];

        scene.player = { x: 100, y: 100 };
        scene.spaghettiRain = scene.add.particles();

        callback({ type: "FRIDAY_DEPLOY" });
        expect(scene.add.text).toHaveBeenCalled();
    });

    it("debe reducir vida del enemigo cuando hay una colisión con un proyectil", () => {
        scene.enemy = setupMockEntity({ hp: 100 });
        scene.enemy.takeDamage = vi.fn((amt) => {
            scene.enemy.hp -= amt;
        });

        let collisionHandler;
        scene.physics.add.collider = vi.fn((obj1, obj2, callback) => {
            collisionHandler = callback;
        });

        scene.physics.add.collider({}, scene.enemy, (obj1, obj2) => {
            obj2.takeDamage(20);
        });

        collisionHandler({}, scene.enemy);
        expect(scene.enemy.hp).toBe(80);
    });

    it("debe pasar al siguiente enemigo cuando el actual es derrotado", () => {
        scene.spawnNextEnemy = vi.fn();
        scene.enemy = { hp: 0 };

        if (scene.enemy.hp <= 0) {
            scene.currentEnemyIndex++;
            scene.spawnNextEnemy();
        }

        expect(scene.currentEnemyIndex).toBe(1);
        expect(scene.spawnNextEnemy).toHaveBeenCalled();
    });

    it("debe terminar el combate si no quedan más enemigos en la cola", () => {
        scene._onCombatEnd = vi.fn();
        scene.currentEnemyIndex = 1;
        scene.enemy = { hp: 0 };

        scene.currentEnemyIndex++;
        if (scene.currentEnemyIndex >= scene.enemyQueue.length) {
            scene._onCombatEnd("player");
        }

        expect(scene._onCombatEnd).toHaveBeenCalledWith("player");
    });

    it("debe actualizar la UI con los datos del enemigo activo", () => {
        scene.player = { hp: 100, maxHP: 100 };
        scene.enemy = { hp: 45, maxHP: 100, enemyType: "GLITCH" };
        scene._updateUI();
        expect(EventBus.emit).toHaveBeenCalledWith(
            "enemy-health",
            expect.objectContaining({ hp: 45 }),
        );
    });

    it("debe gestionar el final del combate emitiendo el resultado para el ranking", () => {
        scene._onCombatEnd("enemy");
        expect(scene.combatFinished).toBe(true);
        expect(EventBus.emit).toHaveBeenCalledWith("combat-result", {
            winner: "enemy",
        });
    });

    it("debe emitir derrota cuando la vida del jugador llega a 0", () => {
        scene.player = { hp: 0 };
        scene._onCombatEnd = vi.fn();

        if (scene.player.hp <= 0) {
            scene._onCombatEnd("enemy");
        }

        expect(scene._onCombatEnd).toHaveBeenCalledWith("enemy");
    });
});
