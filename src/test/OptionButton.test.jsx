import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import OptionButton from '../components/atoms/OptionButton'
import React from 'react';
describe('OptionButton', () => {

  test('muestra el label correctamente', () => {
    render(<OptionButton label="GUERRERO" active={false} onClick={() => {}} />)
    expect(screen.getByText('GUERRERO')).toBeTruthy()
  })

  test('llama a onClick al hacer click', () => {
    const handleClick = vi.fn()
    render(<OptionButton label="MAGO" active={false} onClick={handleClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledOnce()
  })

})