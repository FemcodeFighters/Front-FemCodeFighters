import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import ControlsOverlay from '../components/pages/ControlsOverlay/ControlsOverlay'
import React from 'react';

describe('ControlsOverlay', () => {

  test('muestra los controles de navegación', () => {
    render(<ControlsOverlay onDismiss={() => {}} onBack={() => {}} />)
    expect(screen.getByText('NAVEGACIÓN')).toBeTruthy()
    expect(screen.getByText('MOVERSE')).toBeTruthy()
    expect(screen.getByText('SALTO ACROBÁTICO')).toBeTruthy()
  })

  test('muestra los controles de ataque', () => {
    render(<ControlsOverlay onDismiss={() => {}} onBack={() => {}} />)
    expect(screen.getByText('STACKOVERFLOW SMASH')).toBeTruthy()
    expect(screen.getByText('RUBBER DUCK DEBUGGING')).toBeTruthy()
    expect(screen.getByText('ULTIMATE')).toBeTruthy()
  })

  test('muestra las teclas correctas', () => {
    render(<ControlsOverlay onDismiss={() => {}} onBack={() => {}} />)
    expect(screen.getByText('SPACE')).toBeTruthy()
    expect(screen.getByText('F')).toBeTruthy()
    expect(screen.getByText('G')).toBeTruthy()
    expect(screen.getByText('R')).toBeTruthy()
  })

  test('llama a onDismiss al pulsar INICIALIZAR COMBATE', () => {
    const onDismiss = vi.fn()
    render(<ControlsOverlay onDismiss={onDismiss} onBack={() => {}} />)
    fireEvent.click(screen.getByText('INICIALIZAR COMBATE'))
    expect(onDismiss).toHaveBeenCalledOnce()
  })

  test('llama a onBack al pulsar ← BACK', () => {
    const onBack = vi.fn()
    render(<ControlsOverlay onDismiss={() => {}} onBack={onBack} />)
    fireEvent.click(screen.getByText('← BACK'))
    expect(onBack).toHaveBeenCalledOnce()
  })

})