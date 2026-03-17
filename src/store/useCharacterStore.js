import { create } from "zustand";
import { EventBus } from "../game/EventBus";
import {
    getCharacter,
    updateSkinColor,
    updateHair,
    updateEyeColor,
    updateOutfit,
    updateAccessory,
    updateAll,
    resetCharacter,
} from "../service/playerApi";

const defaultCharacter = {
    skinColor: "#f5c5a3",
    hairStyle: "ponytail",
    hairColor: "#7c3aed",
    eyeColor: "#2563eb",
    outfit: "hoodie",
    outfitColor: "#1e1b4b",
    accessory: "none",
    ultimateSkill: "FRIDAY_DEPLOY",
    sprite: "player_default",
    stats: {
        hp: 100,
        speed: 200,
        attack: 10,
    },
};

const useCharacterStore = create((set, get) => ({
    character: null,
    isLoading: false,
    isSaving: false,
    error: null,

    fetchCharacter: async () => {
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try {
            const data = await getCharacter();
            if (!data) throw new Error("No data received");

            const mappedData = {
                ...data,
                ultimateSkill: data.ultimate_skill || data.ultimateSkill || "FRIDAY_DEPLOY"
            };

            set({ character: mappedData, isLoading: false });
            
            EventBus.emit("character-data-updated", mappedData);
        } catch (error) {
            console.error("Fetch Character Error:", error);
            set({
                isLoading: false,
                error: "Error cargando personaje",
                character: null,
            });
        }
    },

    saveAttribute: async (attributeName, apiFunction, params) => {
        set({ isSaving: true, error: null });
        try {
            const data = await apiFunction(...params);
            set({ character: data, isSaving: false });
            EventBus.emit("character-data-updated", data);
            return data;
        } catch (error) {
            set({
                isSaving: false,
                error: `Error al guardar ${attributeName}`,
            });
            throw error;
        }
    },
    setField: (field, value) => {
        set((state) => ({
            character: state.character
                ? { ...state.character, [field]: value }
                : { ...defaultCharacter, [field]: value },
        }));

        const updatedChar = get().character;
        if (updatedChar) {
            EventBus.emit("character-data-updated", updatedChar);
        }
    },

    saveAll: async () => {
        const currentChar = get().character;
        if (!currentChar) return;

        const selectedSkill = currentChar.ultimateSkill;

        try {
            const updatedData = await get().saveAttribute("personaje completo", updateAll, [
                currentChar,
            ]);

            if (updatedData) {
                const fixedData = {
                    ...updatedData,
                    ultimateSkill: updatedData.ultimateSkill || updatedData.ultimate_skill || selectedSkill
                };
                set({ character: fixedData });
            }
            return updatedData;
        } catch (error) {
            console.error("Error en saveAll:", error);
        }
    },
    saveSkinColor: async () => {
        const char = get().character;
        if (!char) return;
        return await get().saveAttribute("tono de piel", updateSkinColor, [
            char.skinColor,
        ]);
    },

    saveHairStyle: async () => {
        return await get().saveAttribute("pelo", updateHair, [
            get().character.hairStyle,
            get().character.hairColor,
        ]);
    },

    saveEye: async () => {
        return await get().saveAttribute("color de ojos", updateEyeColor, [
            get().character.eyeColor,
        ]);
    },

    saveOutfit: async () => {
        return await get().saveAttribute("ropa", updateOutfit, [
            get().character.outfit,
            get().character.outfitColor,
        ]);
    },

    saveAccessory: async () => {
        return await get().saveAttribute("accesorio", updateAccessory, [
            get().character.accessory,
        ]);
    },
    setUltimate: (skillKey) =>
        set((state) => ({
            character: { ...state.character, ultimateSkill: skillKey },
        })),

    reset: async () => {
        set({ isSaving: true, error: null });
        try {
            const data = await resetCharacter();
            set({ character: data, isSaving: false });
            EventBus.emit("character-data-updated", data);
            return true;
        } catch (error) {
            set({ isSaving: false, error: "Error reseteando personaje" });
            return false;
        }
    },

    clearError: () => set({ error: null }),
}));

export default useCharacterStore;
