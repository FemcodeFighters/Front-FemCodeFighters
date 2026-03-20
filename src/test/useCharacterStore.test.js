import { describe, it, expect, vi, beforeEach } from "vitest";
import useCharacterStore from "../store/useCharacterStore";
import { EventBus } from "../game/EventBus";
import * as playerApi from "../service/playerApi";
import React from 'react';

vi.mock("../service/playerApi", () => ({
    getCharacter: vi.fn(),
    updateSkinColor: vi.fn(),
    updateAll: vi.fn(),
    resetCharacter: vi.fn(),
    updateHair: vi.fn(),
    updateEyeColor: vi.fn(),
    updateOutfit: vi.fn(),
    updateAccessory: vi.fn(),
}));

vi.mock("../game/EventBus", () => ({
    EventBus: {
        emit: vi.fn(),
    },
}));

describe("Character Store", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useCharacterStore.getState().clearCharacter();
    });

    it("fetchCharacter: debe mapear ultimate_skill y emitir evento a Phaser", async () => {
        const mockApiData = {
            skinColor: "#ffffff",
            ultimate_skill: "SUPER_PUNCH",
        };
        playerApi.getCharacter.mockResolvedValue(mockApiData);
        await useCharacterStore.getState().fetchCharacter();
        const state = useCharacterStore.getState();
        expect(state.character.ultimateSkill).toBe("SUPER_PUNCH");
        expect(EventBus.emit).toHaveBeenCalledWith(
            "character-data-updated",
            expect.objectContaining({ ultimateSkill: "SUPER_PUNCH" }),
        );
    });

    it("setField: debe actualizar el estado local y usar valores por defecto si no hay personaje", () => {
        useCharacterStore.getState().setField("hairStyle", "mohawk");
        const state = useCharacterStore.getState();
        expect(state.character.hairStyle).toBe("mohawk");
        expect(state.character.skinColor).toBe("#f5c5a3");
        expect(EventBus.emit).toHaveBeenCalled();
    });

    it("saveSkinColor: debe llamar a la API y actualizar el estado", async () => {
        useCharacterStore.setState({ character: { skinColor: "#111111" } });
        const mockResponse = { skinColor: "#111111", status: "saved" };
        playerApi.updateSkinColor.mockResolvedValue(mockResponse);
        await useCharacterStore.getState().saveSkinColor();
        expect(playerApi.updateSkinColor).toHaveBeenCalledWith("#111111");
        expect(useCharacterStore.getState().isSaving).toBe(false);
    });

    it("reset: debe limpiar el personaje y notificar a Phaser", async () => {
        const mockResetData = { skinColor: "#default" };
        playerApi.resetCharacter.mockResolvedValue(mockResetData);
        const success = await useCharacterStore.getState().reset();
        expect(success).toBe(true);
        expect(useCharacterStore.getState().character).toEqual(mockResetData);
        expect(EventBus.emit).toHaveBeenCalledWith(
            "character-data-updated",
            mockResetData,
        );
    });

    it("clearCharacter: debe resetear todo el estado", () => {
        useCharacterStore.setState({
            character: { id: 1 },
            isLoading: true,
            error: "error",
        });
        useCharacterStore.getState().clearCharacter();
        const state = useCharacterStore.getState();
        expect(state.character).toBeNull();
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });
});
