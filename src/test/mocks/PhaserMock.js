import { vi } from "vitest";

export const mockScene = {
  scale: { width: 800, height: 600 },

  input: {
    keyboard: {
      enabled: false,
    },
  },

  add: {
    existing: vi.fn(),

    text: vi.fn(() => ({
      setOrigin: vi.fn().mockReturnThis(),
      setDepth: vi.fn().mockReturnThis(),
      setAlpha: vi.fn().mockReturnThis(),
      setScale: vi.fn().mockReturnThis(),
      destroy: vi.fn(),
    })),

    rectangle: vi.fn(() => ({
      setVisible: vi.fn(),
      setPosition: vi.fn(),
      destroy: vi.fn(),
    })),

    graphics: vi.fn(() => ({
      setDepth: vi.fn(),
      fillStyle: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      fillPath: vi.fn(),
      lineStyle: vi.fn(),
      strokeLineShape: vi.fn(),
      generateTexture: vi.fn(),
      destroy: vi.fn(),
    })),

    particles: vi.fn(() => ({
      setDepth: vi.fn().mockReturnThis(),
      setFrequency: vi.fn(),
      stop: vi.fn(),
      destroy: vi.fn(),
    })),
  },

  physics: {
    add: {
      existing: vi.fn(),
      collider: vi.fn(),
      staticGroup: vi.fn(() => ({ add: vi.fn() })),
      group: vi.fn(() => ({ getChildren: vi.fn(() => []) })),
    },
    pause: vi.fn(),
  },

  tweens: { add: vi.fn() },

  time: {
    delayedCall: vi.fn(),
    addEvent: vi.fn(),
    now: 0,
  },

  cameras: {
    main: {
      flash: vi.fn(),
      shake: vi.fn(),
      fadeIn: vi.fn(),
      setBackgroundColor: vi.fn(),
    },
  },

  registry: {
    set: vi.fn(),
  },

  events: {
    once: vi.fn(),
  },

  anims: {
    exists: vi.fn(() => false),
  },

  textures: {
    exists: vi.fn(() => false),
    remove: vi.fn(),
  },

  load: {
    image: vi.fn(),
    once: vi.fn(),
    start: vi.fn(),
  },

  make: {
    graphics: vi.fn(() => ({
      fillStyle: vi.fn(),
      fillRect: vi.fn(),
      generateTexture: vi.fn(),
      destroy: vi.fn(),
    })),
  },
};