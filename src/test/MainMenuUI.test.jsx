import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import MainMenuUI from '../components/pages/MainMenu/MainMenuUI'
import { EventBus } from '../game/EventBus'
import React from 'react';
vi.mock('../game/EventBus', () => ({ EventBus: { emit: vi.fn() } }))

beforeEach(() => {
  vi.clearAllMocks()
  global.requestAnimationFrame = vi.fn(() => 1)
  global.cancelAnimationFrame = vi.fn()
})

describe('MainMenuUI', () => {

  const defaultProps = {
    onPlay: () => {},
    onCredits: () => {},
    showCredits: false,
    onCloseCredits: () => {},
  }

  test('muestra el título CODEFIGHTERS', () => {
    render(<MainMenuUI {...defaultProps} />)
    expect(screen.getByText('CODE')).toBeTruthy()
    expect(screen.getByText('FIGHTERS')).toBeTruthy()
  })

  test('muestra los botones PLAY y CREDITS', () => {
    render(<MainMenuUI {...defaultProps} />)
    expect(screen.getByText('> PLAY')).toBeTruthy()
    expect(screen.getByText('CREDITS')).toBeTruthy()
  })

  test('llama a onPlay y emite user-interacted al pulsar PLAY', () => {
    const onPlay = vi.fn()
    render(<MainMenuUI {...defaultProps} onPlay={onPlay} />)
    fireEvent.click(screen.getByText('> PLAY'))
    expect(onPlay).toHaveBeenCalledOnce()
    expect(EventBus.emit).toHaveBeenCalledWith('user-interacted')
  })

  test('llama a onCredits y emite user-interacted al pulsar CREDITS', () => {
    const onCredits = vi.fn()
    render(<MainMenuUI {...defaultProps} onCredits={onCredits} />)
    fireEvent.click(screen.getByText('CREDITS'))
    expect(onCredits).toHaveBeenCalledOnce()
    expect(EventBus.emit).toHaveBeenCalledWith('user-interacted')
  })

  test('no muestra los créditos cuando showCredits es false', () => {
    render(<MainMenuUI {...defaultProps} showCredits={false} />)
    expect(screen.queryByText('JENNIFER CROS')).toBeNull()
  })

  test('muestra los créditos cuando showCredits es true', () => {
    render(<MainMenuUI {...defaultProps} showCredits={true} />)
    expect(screen.getByText('JENNIFER CROS')).toBeTruthy()
    expect(screen.getByText('PHASER 3 + REACT + VITE')).toBeTruthy()
  })

  test('llama a onCloseCredits al pulsar BACK en los créditos', () => {
    const onCloseCredits = vi.fn()
    render(<MainMenuUI {...defaultProps} showCredits={true} onCloseCredits={onCloseCredits} />)
    fireEvent.click(screen.getByText('< BACK'))
    expect(onCloseCredits).toHaveBeenCalledOnce()
  })

})