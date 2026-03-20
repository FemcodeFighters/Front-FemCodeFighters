import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import CharacterEditor from '../components/organisms/CharacterEditor/CharacterEditor'
import useCharacterStore from '../store/useCharacterStore'
import React from 'react';

vi.mock('../store/useCharacterStore', () => ({ default: vi.fn() }))

vi.mock('../components/molecules/CharacterPreview', () => ({
  default: () => <div data-testid="character-preview" />
}))
vi.mock('../components/atoms/SaveToast/SaveToast', () => ({
  default: ({ visible }) => visible ? <div>TOAST</div> : null
}))

describe('CharacterEditor', () => {

  const mockCharacter = {
    skinColor: '#f5c5a3',
    hairColor: '#7c3aed',
    hairStyle: 'ponytail',
    eyeColor: '#2563eb',
    outfitColor: '#1e1b4b',
    accessory: 'none',
    outfit: 'hoodie',
    ultimateSkill: 'FRIDAY_DEPLOY',
  }

  const mockStore = {
    character: mockCharacter,
    isLoading: false,
    isSaving: false,
    error: null,
    fetchCharacter: vi.fn(),
    setField: vi.fn(),
    saveAll: vi.fn(),
    reset: vi.fn(),
    clearError: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useCharacterStore.mockReturnValue(mockStore)
  })

  test('muestra el spinner cuando isLoading es true', () => {
    useCharacterStore.mockReturnValue({ ...mockStore, isLoading: true })
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
    expect(screen.getByText(/ESTABLECIENDO CONEXIÓN NEURAL/)).toBeTruthy()
  })

  test('muestra error si no hay character', () => {
    useCharacterStore.mockReturnValue({ ...mockStore, character: null })
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
    expect(screen.getByText(/PERFIL NEURAL NO ENCONTRADO/)).toBeTruthy()
  })

  test('renderiza las 6 tabs', () => {
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
    ;['PIEL', 'PELO', 'OJOS', 'OUTFIT', 'ACCESORIO', 'HABILIDAD'].forEach(tab => {
      expect(screen.getByText(tab)).toBeTruthy()
    })
  })

  test('muestra la sección de piel por defecto', () => {
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
    expect(screen.getByText('// TONO DE DERMIS')).toBeTruthy()
  })

  test('cambia a la tab de pelo', () => {
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
    fireEvent.click(screen.getByText('PELO'))
    expect(screen.getByText('// ESTILO CAPILAR')).toBeTruthy()
  })

  test('cambia a la tab de habilidad y muestra la skill activa', () => {
  render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
  fireEvent.click(screen.getByText('HABILIDAD'))
  expect(screen.getByText(/Despliegue arriesgado en viernes/)).toBeTruthy()
})

  test('llama a setField al cambiar habilidad', () => {
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
    fireEvent.click(screen.getByText('HABILIDAD'))
    fireEvent.click(screen.getByText('SPAGHETTI CODE'))
    expect(mockStore.setField).toHaveBeenCalledWith('ultimateSkill', 'SPAGHETTI_CODE')
  })

  test('llama a saveAll al pulsar SUBIR DATOS', async () => {
    mockStore.saveAll.mockResolvedValue()
    mockStore.fetchCharacter.mockResolvedValue()
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
    fireEvent.click(screen.getByText('> SUBIR DATOS'))
    expect(mockStore.saveAll).toHaveBeenCalled()
  })

  test('llama a reset al pulsar RESET', () => {
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
    fireEvent.click(screen.getByText('RESET'))
    expect(mockStore.reset).toHaveBeenCalled()
  })

  test('muestra el error del store', () => {
    useCharacterStore.mockReturnValue({ ...mockStore, error: 'Error de red' })
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
    expect(screen.getByText(/Error de red/)).toBeTruthy()
  })

  test('llama a onBack al pulsar ← BACK', () => {
    const onBack = vi.fn()
    render(<CharacterEditor onBack={onBack} onContinue={() => {}} onLogout={() => {}} onEditAccount={() => {}} />)
    fireEvent.click(screen.getByText('← BACK'))
    expect(onBack).toHaveBeenCalledOnce()
  })

  test('llama a onContinue al pulsar CONTINUAR AL COMBATE', () => {
    const onContinue = vi.fn()
    render(<CharacterEditor onBack={() => {}} onContinue={onContinue} onLogout={() => {}} onEditAccount={() => {}} />)
    fireEvent.click(screen.getByText('CONTINUAR AL COMBATE →'))
    expect(onContinue).toHaveBeenCalledOnce()
  })

  test('llama a onLogout al pulsar LOGOUT', () => {
    const onLogout = vi.fn()
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={onLogout} onEditAccount={() => {}} />)
    fireEvent.click(screen.getByText('LOGOUT →'))
    expect(onLogout).toHaveBeenCalledOnce()
  })

  test('llama a onEditAccount al pulsar MI CUENTA', () => {
    const onEditAccount = vi.fn()
    render(<CharacterEditor onBack={() => {}} onContinue={() => {}} onLogout={() => {}} onEditAccount={onEditAccount} />)
    fireEvent.click(screen.getByText('⚙ MI CUENTA'))
    expect(onEditAccount).toHaveBeenCalledOnce()
  })

})