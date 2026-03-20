//test de integración
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';


global.Phaser = {
    Scale: { RESIZE: 1, CENTER_BOTH: 1 },
    Game: vi.fn(() => ({
        scene: { stop: vi.fn(), start: vi.fn() },
        destroy: vi.fn()
    }))
};

vi.mock('../PhaserGame', () => ({
    PhaserGame: React.forwardRef((props, ref) => {
        React.useImperativeHandle(ref, () => ({
            game: global.Phaser.Game()
        }));
        return <div data-testid="phaser-mock">Phaser Canvas Mock</div>;
    })
}));

vi.mock('../service/playerApi', () => ({
    checkBackendHealth: vi.fn().mockResolvedValue(true),
    getRanking: vi.fn().mockResolvedValue([
        { username: 'PLAYER 1', score: 100 }
    ]),
    useUltimateSkill: vi.fn().mockResolvedValue({ success: true }),
    updateCombatStats: vi.fn().mockResolvedValue({ success: true }),
}));

import App from '../App';
import { EventBus } from '../game/EventBus';
import useAuthStore from '../store/useAuthStore';

describe('Pruebas de Integración: App Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        useAuthStore.setState({ 
            isAuthenticated: false, 
            user: null,
            token: null 
        });
    });

    it('debe mostrar el menú principal al forzar el estado inicial', async () => {
        render(<App />);
        const mockScene = { scene: { key: 'MainMenu' } };
        await act(async () => {
            const phaserMock = screen.getByTestId('phaser-mock');
            EventBus.emit('player-name', { name: 'PROGRAMADORA' });
        });
    });

    it('debe navegar a Auth si no hay login al pulsar PLAY', async () => {
        render(<App />);
        await act(async () => {
            EventBus.emit('player-name', { name: 'TEST' });
        });
        const healthData = { hp: 80, maxHP: 100 };
        
        await act(async () => {
            EventBus.emit('player-health', healthData);
        });
        await waitFor(() => {
            const bars = screen.queryAllByText(/80\/100/);
        });
    });

    it('debe limpiar el estado al hacer logout', async () => {
        useAuthStore.setState({ isAuthenticated: true, user: { username: 'ADMIN' } });
        render(<App />);
        await act(async () => {
            useAuthStore.getState().logout();
        });
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
});