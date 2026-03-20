import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import GameModeSelect from '../components/pages/GameMode/GameModeSelect'
import React from 'react';

describe('GameModeSelect', () => {

  test('muestra los dos modos de juego', () => {
    render(<GameModeSelect onSelectSolo={() => {}} onBack={() => {}} />)
    expect(screen.getByText('SOLO')).toBeTruthy()
    expect(screen.getByText('CO-OP ONLINE')).toBeTruthy()
  })

  test('muestra DISPONIBLE y PRÓXIMAMENTE', () => {
    render(<GameModeSelect onSelectSolo={() => {}} onBack={() => {}} />)
    expect(screen.getByText('DISPONIBLE')).toBeTruthy()
    expect(screen.getByText('PRÓXIMAMENTE')).toBeTruthy()
  })

  test('llama a onSelectSolo al hacer click en SOLO', () => {
    const onSelectSolo = vi.fn()
    render(<GameModeSelect onSelectSolo={onSelectSolo} onBack={() => {}} />)
    fireEvent.click(screen.getByText('SOLO'))
    expect(onSelectSolo).toHaveBeenCalledOnce()
  })

  test('llama a onBack al pulsar ← BACK', () => {
    const onBack = vi.fn()
    render(<GameModeSelect onSelectSolo={() => {}} onBack={onBack} />)
    fireEvent.click(screen.getByText('← BACK'))
    expect(onBack).toHaveBeenCalledOnce()
  })

})