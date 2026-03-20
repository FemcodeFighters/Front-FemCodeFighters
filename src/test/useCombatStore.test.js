import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCombatStore } from "../store/useCombatStore";
import * as playerApi from "../service/playerApi";
import React from 'react';

vi.mock("../service/playerApi", () => ({
    useUltimateSkill: vi.fn(),
}));
describe("Combat Store", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useCombatStore.setState({
            isUsingUltimate: false,
            lastCombatResult: null,
        });
    });

    it("debe iniciar con los valores correctos", () => {
        const state = useCombatStore.getState();
        expect(state.isUsingUltimate).toBe(false);
        expect(state.lastCombatResult).toBeNull();
    });
    it("executeUltimate: debe cambiar el estado de carga y guardar el resultado", async () => {
        const mockResult = { damage: 100, victory: true };
        playerApi.useUltimateSkill.mockResolvedValue(mockResult);
        const promise = useCombatStore.getState().executeUltimate();
        expect(useCombatStore.getState().isUsingUltimate).toBe(true);
        const result = await promise;
        const state = useCombatStore.getState();
        expect(result).toEqual(mockResult);
        expect(state.isUsingUltimate).toBe(false);
        expect(state.lastCombatResult).toEqual(mockResult);
    });

    it("executeUltimate: debe volver a false si la API falla y lanzar error", async () => {
        playerApi.useUltimateSkill.mockRejectedValue({
            response: { data: { message: "Energía insuficiente" } },
        });
        const storeAction = useCombatStore.getState().executeUltimate();
        await expect(storeAction).rejects.toThrow("Energía insuficiente");
        expect(useCombatStore.getState().isUsingUltimate).toBe(false);
    });
});
