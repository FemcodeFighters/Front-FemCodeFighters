import { describe, it, expect, vi, beforeEach } from "vitest";
import useAccountStore from "../store/useAccountStore";
import * as userApi from "../service/userApi";
import React from 'react';

vi.mock("../service/userApi", () => ({
    getProfile: vi.fn(),
    updateEmail: vi.fn(),
    updateUsername: vi.fn(),
    changePassword: vi.fn(),
    deleteAccount: vi.fn(),
}));

describe("Account Store", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        const { clearMessages } = useAccountStore.getState();
        clearMessages();
        useAccountStore.setState({
            profile: null,
            isLoading: false,
            error: null,
        });
    });

    it("debe iniciar con valores por defecto", () => {
        const state = useAccountStore.getState();
        expect(state.profile).toBeNull();
        expect(state.isLoading).toBe(false);
    });

    it("fetchProfile: debe cargar el perfil correctamente", async () => {
        const mockProfile = { username: "Gamer123", email: "test@test.com" };
        userApi.getProfile.mockResolvedValue(mockProfile);

        await useAccountStore.getState().fetchProfile();

        const state = useAccountStore.getState();
        expect(state.profile).toEqual(mockProfile);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it("fetchProfile: debe manejar errores de la API", async () => {
        const errorResponse = {
            response: { data: { error: "Token inválido" } },
        };
        userApi.getProfile.mockRejectedValue(errorResponse);
        await useAccountStore.getState().fetchProfile();
        const state = useAccountStore.getState();
        expect(state.profile).toBeNull();
        expect(state.error).toBe("Token inválido");
        expect(state.isLoading).toBe(false);
    });

    it("saveUsername: debe actualizar el perfil y mostrar éxito", async () => {
        const updatedProfile = { username: "NuevoNombre" };
        userApi.updateUsername.mockResolvedValue(updatedProfile);
        await useAccountStore.getState().saveUsername("NuevoNombre");
        const state = useAccountStore.getState();
        expect(state.profile).toEqual(updatedProfile);
        expect(state.success).toBe("Nombre actualizado");
    });

    it("clearMessages: debe limpiar error y success", () => {
        useAccountStore.setState({ error: "Mal", success: "Bien" });
        useAccountStore.getState().clearMessages();
        const state = useAccountStore.getState();
        expect(state.error).toBeNull();
        expect(state.success).toBeNull();
    });
});
