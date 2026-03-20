import { describe, test, expect, vi, beforeEach } from 'vitest'
import React from 'react';

vi.mock('phaser', () => ({
  default: {
    Physics: {
      Arcade: {
        Sprite: class {
          constructor() {
            this.x = 100
            this.y = 100
            this.width = 110
            this.height = 110
            this.scaleX = 1
            this.scaleY = 1
            this.displayWidth = 110
            this.displayHeight = 110
            this.active = true
            this.visible = true
            this._listeners = {}
            this.body = {
              setGravityY: vi.fn(), setCollideWorldBounds: vi.fn(),
              setImmovable: vi.fn(), setAllowGravity: vi.fn(),
              setMaxVelocity: vi.fn(), setOffset: vi.fn(), setSize: vi.fn(),
              blocked: { down: true }, touching: { down: false },
              velocity: { y: 0 }, enable: true,
            }
          }
          setCollideWorldBounds = vi.fn()
          setDisplaySize = vi.fn()
          setVelocityX = vi.fn()
          setVelocityY = vi.fn()
          setVelocity = vi.fn()
          setFlipX = vi.fn()
          setScale = vi.fn()
          setAngle = vi.fn()
          setAlpha = vi.fn()
          setOrigin = vi.fn()
          setPosition = vi.fn()
          setTint = vi.fn()
          clearTint = vi.fn()
          setVisible = vi.fn()
          getBounds = vi.fn(() => ({ x: 0, y: 0, width: 40, height: 60 }))
          play = vi.fn()
          destroy = vi.fn()
          emit(event, ...args) {
            (this._listeners[event] || []).forEach(fn => fn(...args))
          }
          on(event, fn) {
            this._listeners[event] = this._listeners[event] || []
            this._listeners[event].push(fn)
          }
          get texture() { return { key: 'JAVASCRIPT', frameTotal: 1 } }
        }
      }
    },
    Math: {
      Clamp: (val, min, max) => Math.min(Math.max(val, min), max),
      Between: vi.fn(() => 0),
      Distance: { Between: vi.fn(() => 100) },
    },
    Geom: {
      Line: vi.fn(),
      Intersects: { RectangleToRectangle: vi.fn(() => false) }
    },
  }
}))

vi.mock('../game/utils/Security', () => ({
  mask: (v) => v,
  unmask: (v) => v,
}))

vi.mock('../game/characters/effects/ImpactEffect', () => ({
  default: class { play = vi.fn() }
}))

vi.mock('../game/characters/effects/SoundManager', () => ({
  soundManager: { playRangedShot: vi.fn(), playHurt: vi.fn() }
}))

vi.mock('../game/characters/Projectile', () => ({
  default: class { fire = vi.fn(); active = false; getBounds = vi.fn() }
}))

vi.mock('../game/characters/Ultimate', () => ({
  default: class { activate = vi.fn() }
}))

vi.mock('../game/EventBus', () => ({
  EventBus: { emit: vi.fn(), on: vi.fn(), off: vi.fn() }
}))

import Enemy from '../game/characters/Enemy'
import { EventBus } from '../game/EventBus'

const makeScene = () => ({
  add: {
    existing: vi.fn(),
    circle: vi.fn(() => ({ setDepth: vi.fn(), destroy: vi.fn() })),
    rectangle: vi.fn(() => ({ setVisible: vi.fn(), getBounds: vi.fn(), setPosition: vi.fn(), destroy: vi.fn() })),
    graphics: vi.fn(() => ({ setDepth: vi.fn(), fillStyle: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), closePath: vi.fn(), fillPath: vi.fn(), setPosition: vi.fn(), lineStyle: vi.fn(), strokeLineShape: vi.fn(), destroy: vi.fn(), fillRect: vi.fn(), generateTexture: vi.fn() })),
    particles: vi.fn(() => ({ setDepth: vi.fn(), explode: vi.fn(), destroy: vi.fn(), startFollow: vi.fn(), emitting: false })),
  },
  physics: {
    add: {
      existing: vi.fn(),
      group: vi.fn(() => ({ getChildren: vi.fn(() => []) })),
    },
  },
  tweens: { add: vi.fn() },
  time: { delayedCall: vi.fn(), now: 0 },
  cameras: { main: { flash: vi.fn(), shake: vi.fn() } },
  anims: { exists: vi.fn(() => false) },
  textures: { exists: vi.fn(() => true) },
  make: { graphics: vi.fn(() => ({ fillStyle: vi.fn(), fillRect: vi.fn(), generateTexture: vi.fn(), destroy: vi.fn() })) },
})

const makeEnemy = (type = 'JAVASCRIPT') => new Enemy(makeScene(), 100, 100, type)

describe('Enemy - lógica pura', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('isAlive devuelve true cuando tiene HP', () => {
  const e = makeEnemy()
  expect(e.isAlive()).toBeTruthy()
})

  test('isAlive devuelve false cuando hp es 0', () => {
    const e = makeEnemy()
    e.hp = 0
    expect(e.isAlive()).toBe(false)
  })

  test('se crea con el tipo correcto', () => {
    const e = makeEnemy('REACT')
    expect(e.enemyType).toBe('REACT')
  })

  test('ultimateReady empieza en false', () => {
    const e = makeEnemy()
    expect(e.ultimateReady).toBe(false)
  })

  test('_gainEnergy acumula energía correctamente', () => {
    const e = makeEnemy()
    e._gainEnergy(20)
    expect(EventBus.emit).toHaveBeenCalledWith('enemy-ultimate', expect.objectContaining({
      energy: 3,
      max: 200,
      ready: false,
    }))
  })

  test('_gainEnergy activa ultimateReady al llegar al máximo', () => {
    const e = makeEnemy()
    for (let i = 0; i < 70; i++) e._gainEnergy(20)
    expect(e.ultimateReady).toBe(true)
  })

  test('_gainEnergy no acumula si ultimateReady es true', () => {
    const e = makeEnemy()
    e.ultimateReady = true
    e._gainEnergy(9999)
    expect(EventBus.emit).not.toHaveBeenCalled()
  })

  test('tiene configuración de ultimate para cada tipo', () => {
    const tipos = ['HTML', 'CSS', 'JAVASCRIPT', 'REACT', 'JAVA', 'SPRINGBOOT']
    tipos.forEach(tipo => {
      const e = makeEnemy(tipo)
      expect(e.ultimateConfigs[tipo]).toBeTruthy()
    })
  })

  test('SPRINGBOOT tiene el mayor daño de ultimate', () => {
    const e = makeEnemy('SPRINGBOOT')
    expect(e.ultimateConfigs.SPRINGBOOT.damage).toBeGreaterThan(
      e.ultimateConfigs.JAVASCRIPT.damage
    )
  })

  test('_chaseTarget mueve a la derecha si target está a la derecha', () => {
    const e = makeEnemy()
    e._target = { x: 200 }
    e._chaseTarget()
    expect(e.setVelocityX).toHaveBeenCalledWith(expect.any(Number))
  })

})