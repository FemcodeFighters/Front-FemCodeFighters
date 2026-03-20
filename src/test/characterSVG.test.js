import { describe, test, expect } from 'vitest'
import { generateCharacterFrames } from '../components/molecules/characterSVG'
import React from 'react';

const baseCharacter = {
  skinColor: '#f5c5a3',
  hairColor: '#7c3aed',
  hairStyle: 'ponytail',
  eyeColor: '#2563eb',
  outfitColor: '#1e1b4b',
  accessory: 'none',
  outfit: 'hoodie',
}

describe('generateCharacterFrames', () => {

  test('devuelve 4 frames para idle', () => {
    const frames = generateCharacterFrames(baseCharacter, 'idle')
    expect(frames).toHaveLength(4)
  })

  test('devuelve 4 frames para run', () => {
    const frames = generateCharacterFrames(baseCharacter, 'run')
    expect(frames).toHaveLength(4)
  })

  test('devuelve 4 frames para attack', () => {
    const frames = generateCharacterFrames(baseCharacter, 'attack')
    expect(frames).toHaveLength(4)
  })

  test('devuelve 2 frames para hurt', () => {
    const frames = generateCharacterFrames(baseCharacter, 'hurt')
    expect(frames).toHaveLength(2)
  })

  test('devuelve 3 frames para jump', () => {
    const frames = generateCharacterFrames(baseCharacter, 'jump')
    expect(frames).toHaveLength(3)
  })

  test('cae a idle si la animación no existe', () => {
    const frames = generateCharacterFrames(baseCharacter, 'inexistente')
    expect(frames).toHaveLength(4)
  })

  test('cada frame es un string SVG válido', () => {
    const frames = generateCharacterFrames(baseCharacter, 'idle')
    frames.forEach(frame => {
      expect(typeof frame).toBe('string')
      expect(frame).toContain('<svg')
      expect(frame).toContain('</svg>')
    })
  })

  test('usa los colores del personaje en los frames', () => {
    const frames = generateCharacterFrames(baseCharacter, 'idle')
    expect(frames[0]).toContain('#f5c5a3')
    expect(frames[0]).toContain('#7c3aed')
  })

  test('funciona con un personaje vacío usando valores por defecto', () => {
    const frames = generateCharacterFrames({}, 'idle')
    expect(frames).toHaveLength(4)
  })

  test('funciona con character null', () => {
    const frames = generateCharacterFrames(null, 'idle')
    expect(frames).toHaveLength(4)
  })

})