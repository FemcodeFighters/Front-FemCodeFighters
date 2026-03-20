import { render } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import CharacterPreview from '../components/molecules/CharacterPreview'
import React from 'react';

describe('CharacterPreview', () => {

  const baseCharacter = {
    skinColor: '#f5c5a3',
    hairColor: '#7c3aed',
    hairStyle: 'ponytail',
    eyeColor: '#2563eb',
    outfitColor: '#1e1b4b',
    accessory: 'none',
    outfit: 'hoodie',
  }

  test('renderiza un SVG', () => {
    const { container } = render(<CharacterPreview character={baseCharacter} />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  test('aplica el tamaño por defecto de 180', () => {
    const { container } = render(<CharacterPreview character={baseCharacter} />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('width')).toBe('90')
    expect(svg.getAttribute('height')).toBe('180')
  })

  test('aplica un tamaño personalizado', () => {
    const { container } = render(<CharacterPreview character={baseCharacter} size={80} />)
    const svg = container.querySelector('svg')
    expect(svg.getAttribute('width')).toBe('40')
    expect(svg.getAttribute('height')).toBe('80')
  })

  test('renderiza sin errores con valores por defecto', () => {
    const { container } = render(<CharacterPreview character={{}} />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

})