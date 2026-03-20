import { vi } from "vitest";
import React from 'react';

class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, cb) {
    this.events[event] = cb;
  }
  off() {}
  emit(event, data) {
    if (this.events[event]) this.events[event](data);
  }
}

class ArcadeSprite {
  constructor(scene, x, y, texture) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.texture = texture;

    this.body = {
      setAllowGravity: vi.fn(),
      setVelocity: vi.fn(),
      setVelocityX: vi.fn(),
      setVelocityY: vi.fn(),
      setCollideWorldBounds: vi.fn(),
    };
  }

  setActive() { return this; }
  setVisible() { return this; }
  setVelocity() { return this; }
  setVelocityX() { return this; }
  setVelocityY() { return this; }
  destroy() {}
}

class Scene {
  constructor() {
    this.scale = { width: 800, height: 600 };

    this.input = {
      keyboard: { enabled: true },
    };

    this.add = {
      existing: vi.fn(),
      text: vi.fn(() => ({
        setOrigin: vi.fn().mockReturnThis(),
        setDepth: vi.fn().mockReturnThis(),
        setAlpha: vi.fn().mockReturnThis(),
        setScale: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
      })),
      rectangle: vi.fn(() => ({})),
      graphics: vi.fn(() => ({
        fillStyle: vi.fn(),
        fillRect: vi.fn(),
        generateTexture: vi.fn(),
        destroy: vi.fn(),
      })),
      particles: vi.fn(() => ({
        setDepth: vi.fn().mockReturnThis(),
        setFrequency: vi.fn(),
        stop: vi.fn(),
      })),
    };

    this.physics = {
      add: {
        collider: vi.fn(),
        staticGroup: vi.fn(() => ({ add: vi.fn() })),
        existing: vi.fn(),
      },
      pause: vi.fn(),
    };

    this.time = {
      delayedCall: vi.fn(),
      addEvent: vi.fn(),
    };

    this.tweens = {
      add: vi.fn(),
    };

    this.cameras = {
      main: {
        flash: vi.fn(),
        shake: vi.fn(),
        fadeIn: vi.fn(),
        setBackgroundColor: vi.fn(),
      },
    };

    this.registry = {
      set: vi.fn(),
    };

    this.events = {
      once: vi.fn(),
    };

    this.textures = {
      exists: vi.fn(() => false),
      remove: vi.fn(),
    };

    this.load = {
      image: vi.fn(),
      once: vi.fn(),
      start: vi.fn(),
    };

    this.make = {
      graphics: vi.fn(() => ({
        fillStyle: vi.fn(),
        fillRect: vi.fn(),
        generateTexture: vi.fn(),
        destroy: vi.fn(),
      })),
    };
  }
}

const PhaserMock = {
  Scene,
  Events: {
    EventEmitter,
  },
  Physics: {
    Arcade: {
      Sprite: ArcadeSprite,
    },
  },
  Input: {
    Keyboard: {
      KeyCodes: { F: 70, G: 71, R: 82 },
      JustDown: vi.fn(() => false),
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
};

global.Phaser = PhaserMock;

vi.mock("phaser", () => ({
  default: PhaserMock,
  Scene: PhaserMock.Scene,
  Events: PhaserMock.Events,
  Physics: PhaserMock.Physics,
}));