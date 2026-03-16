import { create } from "zustand";
import {
    getCharacter,
    updateSkinColor,
    updateHair,
    updateEyeColor,
    updateOutfit,
    updateAccessory,
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
};

const useCharacterStore = create((set, get) => ({
    character: { ...defaultCharacter },
    isLoading: false,
    isSaving: false,
    error: null,

    //cargar personaje desde la API
    fetchCharacter: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getCharacter();
            set({ character: data, isLoading: false });
        } catch {
            set({ isLoading: false, error: "Error cargando personaje" });
        }
    },

    //actualizar campo local (sin guardar aún)
    setField: (field, value) => {
        set((state) => ({
            character: { ...state.character, [field]: value },
        }));
    },

    //guardar en la API
    saveSkinColor: async () => {
        set({ isSaving: true });
        try {
            const { skinColor } = get().character;
            const data = await updateSkinColor(skinColor);
            set({ character: data, isSaving: false });
        } catch {
            set({ isSaving: false, error: "Error guardando color de piel" });
        }
    },

    saveHair: async () => {
        set({ isSaving: true });
        try {
            const { hairStyle, hairColor } = get().character;
            const data = await updateHair(hairStyle, hairColor);
            set({ character: data, isSaving: false });
        } catch {
            set({ isSaving: false, error: "Error guardando pelo" });
        }
    },

    saveEyeColor: async () => {
        set({ isSaving: true });
        try {
            const { eyeColor } = get().character;
            const data = await updateEyeColor(eyeColor);
            set({ character: data, isSaving: false });
        } catch {
            set({ isSaving: false, error: "Error guardando color de ojos" });
        }
    },

    saveOutfit: async () => {
        set({ isSaving: true });
        try {
            const { outfit, outfitColor } = get().character;
            const data = await updateOutfit(outfit, outfitColor);
            set({ character: data, isSaving: false });
        } catch {
            set({ isSaving: false, error: "Error guardando outfit" });
        }
    },

    saveAccessory: async () => {
        set({ isSaving: true });
        try {
            const { accessory } = get().character;
            const data = await updateAccessory(accessory);
            set({ character: data, isSaving: false });
        } catch {
            set({ isSaving: false, error: "Error guardando accesorio" });
        }
    },

    reset: async () => {
        set({ isSaving: true });
        try {
            const data = await resetCharacter();
            set({ character: data, isSaving: false });
        } catch {
            set({ isSaving: false, error: "Error reseteando personaje" });
        }
    },

    clearError: () => set({ error: null }),
}));

export default useCharacterStore;
