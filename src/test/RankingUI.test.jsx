import { render, screen, act } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import RankingUI from '../components/pages/Ranking/RankingUI'
import React from 'react';

describe('RankingUI', () => {

  beforeEach(() => {
    vi.useFakeTimers()
  })

  const mockData = [
    { username: 'Jenny', wins: 10, losses: 2 },
    { username: 'Ragna', wins: 7, losses: 5 },
    { username: 'Prueba', wins: 3, losses: 8 },
  ]

  test('muestra el título HALL OF FAME', () => {
    render(<RankingUI data={mockData} onBack={() => {}} />)
    expect(screen.getByText('HALL OF FAME')).toBeTruthy()
  })

  test('muestra los jugadores con sus datos', () => {
    render(<RankingUI data={mockData} onBack={() => {}} />)
    expect(screen.getByText('Jenny')).toBeTruthy()
    expect(screen.getByText('Ragna')).toBeTruthy()
    expect(screen.getByText('Prueba')).toBeTruthy()
  })

  test('calcula el ratio correctamente', () => {
    render(<RankingUI data={[{ username: 'Jenny', wins: 10, losses: 2 }]} onBack={() => {}} />)
    expect(screen.getByText('83.3%')).toBeTruthy()
  })

  test('muestra 0.0% cuando no hay partidas', () => {
    render(<RankingUI data={[{ username: 'nueva', wins: 0, losses: 0 }]} onBack={() => {}} />)
    expect(screen.getByText('0.0%')).toBeTruthy()
  })

  test('muestra NO DATA FOUND cuando no hay datos', () => {
    render(<RankingUI data={[]} onBack={() => {}} />)
    expect(screen.getByText('NO DATA FOUND_')).toBeTruthy()
  })

  test('muestra el countdown inicial en 10', () => {
    render(<RankingUI data={mockData} onBack={() => {}} />)
    expect(screen.getByText(/RETURNING TO MAIN_MENU IN 10S/)).toBeTruthy()
  })

  test('decrementa el countdown cada segundo', async () => {
    render(<RankingUI data={mockData} onBack={() => {}} />)
    await act(async () => vi.advanceTimersByTime(3000))
    expect(screen.getByText(/RETURNING TO MAIN_MENU IN 7S/)).toBeTruthy()
  })

  test('llama a onBack después de 10 segundos', async () => {
    const onBack = vi.fn()
    render(<RankingUI data={mockData} onBack={onBack} />)
    await act(async () => vi.advanceTimersByTime(10000))
    expect(onBack).toHaveBeenCalled()
  })

  test('llama a onBack al pulsar EXIT_NOW', () => {
    const onBack = vi.fn()
    render(<RankingUI data={mockData} onBack={onBack} />)
    screen.getByText('[ EXIT_NOW ]').click()
    expect(onBack).toHaveBeenCalledOnce()
  })

  test('muestra los ranks correctamente', () => {
    render(<RankingUI data={mockData} onBack={() => {}} />)
    expect(screen.getByText('#1')).toBeTruthy()
    expect(screen.getByText('#2')).toBeTruthy()
    expect(screen.getByText('#3')).toBeTruthy()
  })

})