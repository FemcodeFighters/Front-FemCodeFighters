import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import UltimateSelector from '../components/molecules/UltimateSelector/UltimateSelector'
import useCharacterStore from '../store/useCharacterStore'
import React from 'react';

vi.mock('../store/useCharacterStore', () => ({
  default: vi.fn()
}))

vi.mock('../constants/UltimateSkills', () => ({
  ULTIMATE_INFO: {
    FRIDAY_DEPLOY: {
      id: 'FRIDAY_DEPLOY',
      name: 'Friday Deploy',
      description: 'Intentas arreglar un bug crítico minutos antes de salir. El estrés te vuelve invulnerable temporalmente y recuperas 30 HP.',
      stats: 'Heal: +30 | Invulnerable: 0.5s',
      color: '#00ff00',
      icon: '⚠️',
    },
    SPAGHETTI_CODE: {
      id: 'SPAGHETTI_CODE',
      name: 'Spaghetti Code',
      description: 'Lanzas una maraña de código sin documentar. Los enemigos se enredan sufriendo daño constante por cada tick.',
      stats: 'Damage: 5/tick | Range: 300px',
      color: '#ffff00',
      icon: '🍝',
    },
    GIT_CLONE: {
      id: 'GIT_CLONE',
      name: 'Git Clone',
      description: 'Creas una instancia duplicada de ti mismo que embiste a toda velocidad hacia adelante infligiendo daño masivo.',
      stats: 'Damage: 30 | Speed: 1200',
      color: '#3b82f6',
      icon: '👥',
    },
  }
}))

describe('UltimateSelector', () => {

  const mockSetUltimate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    useCharacterStore.mockReturnValue({
      character: { ultimateSkill: 'FRIDAY_DEPLOY' },
      setUltimate: mockSetUltimate,
    })
  })

  test('renderiza todos los skills', () => {
    render(<UltimateSelector />)
    expect(screen.getByText('Friday Deploy')).toBeTruthy()
    expect(screen.getByText('Spaghetti Code')).toBeTruthy()
    expect(screen.getByText('Git Clone')).toBeTruthy()
  })

  test('muestra la descripción del skill activo', () => {
    render(<UltimateSelector />)
    expect(screen.getByText(/Intentas arreglar un bug crítico/)).toBeTruthy()
  })

  test('muestra las stats del skill activo', () => {
    render(<UltimateSelector />)
    expect(screen.getByText(/Heal: \+30/)).toBeTruthy()
  })

  test('llama a setUltimate al hacer click en un skill', () => {
    render(<UltimateSelector />)
    fireEvent.click(screen.getByText('Git Clone'))
    expect(mockSetUltimate).toHaveBeenCalledWith('GIT_CLONE')
  })

  test('muestra el skill activo cuando cambia el store', () => {
    useCharacterStore.mockReturnValue({
      character: { ultimateSkill: 'SPAGHETTI_CODE' },
      setUltimate: mockSetUltimate,
    })
    render(<UltimateSelector />)
    expect(screen.getByText(/Los enemigos se enredan/)).toBeTruthy()
  })

})