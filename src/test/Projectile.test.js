import { describe, test, expect, vi, beforeEach } from "vitest";
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
                        this.active = true;
                        this.angle = 0;
                        this._listeners = {};
                        this.body = {
                            setAllowGravity: vi.fn(),
                        };
                    }
                    setVelocityX = vi.fn();
                    setActive = vi.fn((v) => {
                        this.active = v;
                    });
                    setVisible = vi.fn();
                    setFlipX = vi.fn();
                    setAngle = vi.fn();
                    setDisplaySize = vi.fn();
                    setDepth = vi.fn();
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
                        return { key: "projectile-duck", frameTotal: 1 };
                    }
                },
            },
        },
    },
}));

import Projectile from "../game/characters/Projectile";

const makeScene = () => ({
    add: { existing: vi.fn() },
    physics: { add: { existing: vi.fn() } },
    textures: { exists: vi.fn(() => true), addBase64: vi.fn() },
    time: { delayedCall: vi.fn(() => ({ remove: vi.fn() })) },
    scale: { width: 800, height: 600 },
});

const makeOwner = () => ({ x: 50, takeDamage: vi.fn() });

const makeProjectile = (type = "duck") => {
    const scene = makeScene();
    const owner = makeOwner();
    return {
        projectile: new Projectile(scene, 100, 100, owner, type),
        scene,
        owner,
    };
};

describe("Projectile", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("se crea con daño 30 por defecto", () => {
        const { projectile } = makeProjectile();
        expect(projectile.damage).toBe(30);
    });

    test("se crea con velocidad 500", () => {
        const { projectile } = makeProjectile();
        expect(projectile.speed).toBe(500);
    });

    test("fire dispara en la dirección correcta", () => {
        const { projectile } = makeProjectile();
        projectile.fire(1);
        expect(projectile.setVelocityX).toHaveBeenCalledWith(500);
    });

    test("fire dispara en dirección negativa", () => {
        const { projectile } = makeProjectile();
        projectile.fire(-1);
        expect(projectile.setVelocityX).toHaveBeenCalledWith(-500);
    });

    test("fire activa el proyectil", () => {
        const { projectile } = makeProjectile();
        projectile.fire(1);
        expect(projectile.setActive).toHaveBeenCalledWith(true);
        expect(projectile.setVisible).toHaveBeenCalledWith(true);
    });

    test("onHit llama a takeDamage del target", () => {
        const { projectile, owner } = makeProjectile();
        const target = { takeDamage: vi.fn() };
        projectile.onHit(target);
        expect(target.takeDamage).toHaveBeenCalledWith(30, owner);
    });

    test("onHit no hace nada si el target es el owner", () => {
        const { projectile, owner } = makeProjectile();
        projectile.onHit(owner);
        expect(owner.takeDamage).not.toHaveBeenCalled();
    });

    test("onHit no hace nada si el proyectil no está activo", () => {
        const { projectile } = makeProjectile();
        projectile.active = false;
        const target = { takeDamage: vi.fn() };
        projectile.onHit(target);
        expect(target.takeDamage).not.toHaveBeenCalled();
    });

    test("_destroyProjectile desactiva el proyectil", () => {
        const { projectile } = makeProjectile();
        projectile.deathTimer = { remove: vi.fn() };
        projectile._destroyProjectile();
        expect(projectile.setActive).toHaveBeenCalledWith(false);
        expect(projectile.setVisible).toHaveBeenCalledWith(false);
        expect(projectile.destroy).toHaveBeenCalled();
    });
});
