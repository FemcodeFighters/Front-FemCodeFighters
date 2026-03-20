import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import AccountEditor from '../components/organisms/AccountEditor/AccountEditor'
import useAccountStore from '../store/useAccountStore'
import React from 'react';

vi.mock('../store/useAccountStore', () => ({
  default: vi.fn()
}))

describe('AccountEditor', () => {

  const mockStore = {
    profile: { username: 'jenny', email: 'jenny@test.com' },
    isLoading: false,
    isSaving: false,
    error: null,
    success: null,
    fetchProfile: vi.fn(),
    saveUsername: vi.fn(),
    saveEmail: vi.fn(),
    savePassword: vi.fn(),
    removeAccount: vi.fn(),
    clearMessages: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useAccountStore.mockReturnValue(mockStore)
  })

  test('muestra los datos del perfil', () => {
    render(<AccountEditor onBack={() => {}} />)
    expect(screen.getByText('jenny')).toBeTruthy()
    expect(screen.getByText('jenny@test.com')).toBeTruthy()
  })

  test('muestra el spinner de carga cuando isLoading es true', () => {
    useAccountStore.mockReturnValue({ ...mockStore, isLoading: true })
    render(<AccountEditor onBack={() => {}} />)
    expect(screen.getByText('// CARGANDO PERFIL...')).toBeTruthy()
  })

  test('muestra las 3 tabs', () => {
    render(<AccountEditor onBack={() => {}} />)
    expect(screen.getByText('NOMBRE')).toBeTruthy()
    expect(screen.getByText('EMAIL')).toBeTruthy()
    expect(screen.getByText('PASSWORD')).toBeTruthy()
  })

  test('cambia de tab al hacer click', () => {
    render(<AccountEditor onBack={() => {}} />)
    fireEvent.click(screen.getByText('EMAIL'))
    expect(screen.getByPlaceholderText('Nuevo email')).toBeTruthy()
  })

  test('muestra el formulario de password al cambiar a esa tab', () => {
    render(<AccountEditor onBack={() => {}} />)
    fireEvent.click(screen.getByText('PASSWORD'))
    expect(screen.getByPlaceholderText('Contraseña actual')).toBeTruthy()
    expect(screen.getByPlaceholderText('Nueva contraseña (mín. 6 caracteres)')).toBeTruthy()
  })

  test('llama a saveUsername al guardar en tab NOMBRE', async () => {
    render(<AccountEditor onBack={() => {}} />)
    fireEvent.click(screen.getByText('> GUARDAR'))
    expect(mockStore.saveUsername).toHaveBeenCalledWith('jenny')
  })

  test('llama a saveEmail al guardar en tab EMAIL', async () => {
    render(<AccountEditor onBack={() => {}} />)
    fireEvent.click(screen.getByText('EMAIL'))
    fireEvent.click(screen.getByText('> GUARDAR'))
    expect(mockStore.saveEmail).toHaveBeenCalledWith('jenny@test.com')
  })

  test('muestra el error cuando existe', () => {
    useAccountStore.mockReturnValue({ ...mockStore, error: 'Email ya en uso' })
    render(<AccountEditor onBack={() => {}} />)
    expect(screen.getByText(/Email ya en uso/)).toBeTruthy()
  })

  test('muestra el mensaje de éxito cuando existe', () => {
    useAccountStore.mockReturnValue({ ...mockStore, success: 'Guardado correctamente' })
    render(<AccountEditor onBack={() => {}} />)
    expect(screen.getByText(/Guardado correctamente/)).toBeTruthy()
  })

  test('muestra confirmación al pulsar ELIMINAR CUENTA', () => {
    render(<AccountEditor onBack={() => {}} />)
    fireEvent.click(screen.getByText('ELIMINAR CUENTA'))
    expect(screen.getByText(/Esta acción no se puede deshacer/)).toBeTruthy()
  })

  test('cancela la confirmación de borrado', () => {
    render(<AccountEditor onBack={() => {}} />)
    fireEvent.click(screen.getByText('ELIMINAR CUENTA'))
    fireEvent.click(screen.getByText('CANCELAR'))
    expect(screen.getByText('ELIMINAR CUENTA')).toBeTruthy()
  })

  test('llama a removeAccount al confirmar borrado', () => {
    render(<AccountEditor onBack={() => {}} />)
    fireEvent.click(screen.getByText('ELIMINAR CUENTA'))
    fireEvent.click(screen.getByText('SÍ, ELIMINAR'))
    expect(mockStore.removeAccount).toHaveBeenCalled()
  })

  test('llama a onBack al pulsar ← BACK', () => {
    const onBack = vi.fn()
    render(<AccountEditor onBack={onBack} />)
    fireEvent.click(screen.getByText('← BACK'))
    expect(onBack).toHaveBeenCalledOnce()
  })

})