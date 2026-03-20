import { describe, test, expect, vi, beforeEach } from 'vitest'
import { mockScene } from './mocks/PhaserMock.js'
import React from 'react';
vi.mock('phaser', () => ({
  default: {
    Physics: {
      Arcade: {
        Sprite: class {
          constructor() {
            this.x = 0
            this.y = 0
            this.scaleX = 1
            this.scaleY = 1
            this.displayWidth = 40
            this.displayHeight = 60
            this.body = {
              setGravityY: vi.fn(), setCollideWorldBounds: vi.fn(),
              setImmovable: vi.fn(), setAllowGravity: vi.fn(),
              setMaxVelocity: vi.fn(), setOffset: vi.fn(), setSize: vi.fn(),
              blocked: { down: true }, touching: { down: false },
              velocity: { y: 0 },
            }
            this._listeners = {}
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
          setPosition = vi.fn()
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
          get texture() { return { key: 'test', frameTotal: 1 } }
        }
      }
    },
    Math: { Clamp: (val, min, max) => Math.min(Math.max(val, min), max), Between: vi.fn(() => 0) },
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
  default: class {
    play = vi.fn()
  }
}))

vi.mock('../game/characters/effects/SoundManager', () => ({
  soundManager: { playRangedShot: vi.fn(), playHurt: vi.fn() }
}))

vi.mock('../game/characters/Projectile', () => ({
  default: class {
    fire = vi.fn()
    active = false
    getBounds = vi.fn()
  }
}))

import Character, { CharacterState } from '../game/characters/Character'

const makeCharacter = (config = {}) => new Character(
  mockScene, 100, 100, 'test',
  { maxHP: 100, attackDamage: 10, ...config }
)

describe('CharacterState', () => {
  test('tiene todos los estados definidos', () => {
    expect(CharacterState.IDLE).toBe('idle')
    expect(CharacterState.RUN).toBe('run')
    expect(CharacterState.JUMP).toBe('jump')
    expect(CharacterState.FALL).toBe('fall')
    expect(CharacterState.ATTACK).toBe('attack')
    expect(CharacterState.HURT).toBe('hurt')
    expect(CharacterState.DEAD).toBe('dead')
  })
})

describe('Character - lógica pura', () => {

  test('isAlive devuelve true cuando no está muerto', () => {
    const c = makeCharacter()
    expect(c.isAlive()).toBe(true)
  })

  test('isAlive devuelve false cuando está muerto', () => {
    const c = makeCharacter()
    c.state = CharacterState.DEAD
    expect(c.isAlive()).toBe(false)
  })

  test('getHealthPercent devuelve 1 con HP máximo', () => {
    const c = makeCharacter()
    expect(c.getHealthPercent()).toBe(1)
  })

  test('getHealthPercent devuelve 0.5 con la mitad de HP', () => {
    const c = makeCharacter()
    c.hp = 50
    expect(c.getHealthPercent()).toBe(0.5)
  })

  test('hp no puede superar maxHP', () => {
    const c = makeCharacter()
    c.hp = 999
    expect(c.hp).toBe(100)
  })

  test('hp no puede ser negativo', () => {
    const c = makeCharacter()
    c.hp = -50
    expect(c.hp).toBe(0)
  })

  test('_isActionLocked devuelve true cuando está HURT', () => {
    const c = makeCharacter()
    c.state = CharacterState.HURT
    expect(c._isActionLocked()).toBe(true)
  })

  test('_isActionLocked devuelve true cuando está DEAD', () => {
    const c = makeCharacter()
    c.state = CharacterState.DEAD
    expect(c._isActionLocked()).toBe(true)
  })

  test('_isActionLocked devuelve true cuando está ATTACK', () => {
    const c = makeCharacter()
    c.state = CharacterState.ATTACK
    expect(c._isActionLocked()).toBe(true)
  })

  test('_isActionLocked devuelve false cuando está IDLE', () => {
    const c = makeCharacter()
    c.state = CharacterState.IDLE
    expect(c._isActionLocked()).toBe(false)
  })

  test('setState cambia el estado', () => {
    const c = makeCharacter()
    c.setState(CharacterState.RUN)
    expect(c.state).toBe(CharacterState.RUN)
  })

  test('setState no cambia si el estado es el mismo', () => {
    const c = makeCharacter()
    c.state = CharacterState.IDLE
    const result = c.setState(CharacterState.IDLE)
    expect(result).toBe(c)
  })

  test('attackDamage usa el valor del config', () => {
    const c = makeCharacter({ attackDamage: 25 })
    expect(c.attackDamage).toBe(25)
  })

  test('maxHP usa el valor del config', () => {
    const c = makeCharacter({ maxHP: 200 })
    expect(c.maxHP).toBe(200)
  })

})