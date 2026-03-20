import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../service/api';
import * as playerService from '../service/playerApi';
import React from 'react';
vi.mock('../service/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn()
    }
}));

describe('Player Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('getCharacter', () => {
        it('debe devolver los datos del personaje si la petición tiene éxito', async () => {
            const mockPlayer = { skinColor: '#ffffff', hairStyle: 'punk' };
            api.get.mockResolvedValue({ data: mockPlayer });
            const result = await playerService.getCharacter();
            expect(api.get).toHaveBeenCalledWith('/api/player');
            expect(result).toEqual(mockPlayer);
        });

        it('debe devolver el personaje por defecto (fallback) si la petición falla', async () => {
            api.get.mockRejectedValue(new Error('Server Down'));
            const result = await playerService.getCharacter();
            expect(result.skinColor).toBe('#ffdbac');
            expect(result.hairStyle).toBe('normal');
        });
    });

    describe('Personalización (formatColor)', () => {
        it('updateSkinColor debe añadir el "#" si falta y validar longitud', async () => {
            api.patch.mockResolvedValue({ data: { success: true } });
            await playerService.updateSkinColor('ff0000');
            expect(api.patch).toHaveBeenCalledWith('/api/player/skin', { skinColor: '#ff0000' });
            await playerService.updateSkinColor('invalid');
            expect(api.patch).toHaveBeenLastCalledWith('/api/player/skin', { skinColor: '#ffffff' });
        });
    });

    describe('Ranking y Stats', () => {
        it('getRanking debe devolver un array vacío si falla el servidor', async () => {
            api.get.mockRejectedValue(new Error('Fail'));
            const result = await playerService.getRanking();
            expect(result).toEqual([]);
        });

        it('updateCombatStats debe enviar "true" o "false" en la URL', async () => {
            api.post.mockResolvedValue({ data: 'ok' });
            await playerService.updateCombatStats(true);
            expect(api.post).toHaveBeenCalledWith('/api/player/combat-result/true', {});
            await playerService.updateCombatStats(false);
            expect(api.post).toHaveBeenCalledWith('/api/player/combat-result/false', {});
        });
    });

    describe('Ultimate Skill y Health', () => {
        it('checkBackendHealth debe devolver true si el servidor responde', async () => {
            api.get.mockResolvedValue({});
            const result = await playerService.checkBackendHealth();
            expect(result).toBe(true);
        });

        it('useUltimateSkill debe llamar al endpoint de post', async () => {
            api.post.mockResolvedValue({ data: { used: true } });
            await playerService.useUltimateSkill();
            expect(api.post).toHaveBeenCalledWith('/api/player/use-ultimate');
        });
    });
});