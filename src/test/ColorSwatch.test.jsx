import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import ColorSwatch from '../components/atoms/ColorSwatch'
import React from 'react';

describe('ColorSwatch', () => {

  test('renderiza el botón con el color correcto', () => {
    render(<ColorSwatch color="#ff0000" active={false} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button.style.background).toBe('rgb(255, 0, 0)')
  })

  test('llama a onClick con el color al hacer click', () => {
    const handleClick = vi.fn()
    render(<ColorSwatch color="#ff0000" active={false} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledWith('#ff0000')
  })

  test('tiene aria-label con el valor del color', () => {
    render(<ColorSwatch color="#ff0000" active={false} onClick={() => {}} />)
    expect(screen.getByLabelText('#ff0000')).toBeTruthy()
  })

})