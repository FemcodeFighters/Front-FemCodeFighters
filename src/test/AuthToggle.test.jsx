import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import AuthToggle from '../components/atoms/AuthToggle'
import React from 'react';

describe('AuthToggle', () => {

  test('muestra texto de registro cuando mode es login', () => {
    render(<AuthToggle mode="login" onToggle={() => {}} />)
    expect(screen.getByText(/¿No tienes cuenta?/)).toBeTruthy()
    expect(screen.getByText('REGÍSTRATE')).toBeTruthy()
  })

  test('muestra texto de login cuando mode es register', () => {
    render(<AuthToggle mode="register" onToggle={() => {}} />)
    expect(screen.getByText(/¿Ya tienes cuenta?/)).toBeTruthy()
    expect(screen.getByText('INICIA SESIÓN')).toBeTruthy()
  })

  test('llama a onToggle al hacer click', () => {
    const handleToggle = vi.fn()
    render(<AuthToggle mode="login" onToggle={handleToggle} />)
    fireEvent.click(screen.getByRole('button'))
    expect(handleToggle).toHaveBeenCalledOnce()
  })

})