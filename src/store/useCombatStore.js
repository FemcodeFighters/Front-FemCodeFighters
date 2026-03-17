import { create } from "zustand";
import { useUltimateSkill } from "../service/playerApi";

export const useCombatStore = create((set) => ({
    isUsingUltimate: false,
    lastCombatResult: null,

    executeUltimate: async () => {
        set({ isUsingUltimate: true });
        try {
            const data = await useUltimateSkill();
            set({
                isUsingUltimate: false,
                lastCombatResult: data,
            });
            return data;
        } catch (error) {
            set({ isUsingUltimate: false });
            throw new Error(
                error.response?.data?.message || "Error al usar la habilidad",
            );
        }
    },
}));
