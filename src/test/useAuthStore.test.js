import { describe, it, expect, vi, beforeEach } from "vitest";
import useAuthStore from "../store/useAuthStore";
import * as authApi from "../service/authApi";
import React from 'react';
const clearCharacterSpy = vi.fn();
vi.mock("../service/authApi", () => ({
    login: vi.fn(),
    register: vi.fn(),
}));
vi.mock("../store/useCharacterStore", () => ({
    default: {
        getState: vi.fn(() => ({
            clearCharacter: clearCharacterSpy,
        })),
    },
}));
describe("Auth Store", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        useAuthStore.setState({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    });
    it("login: debe guardar el token y usuario en localStorage y el estado", async () => {
        const mockResponse = {
            token: "fake-token-123",
            userId: "user-001",
            username: "testplayer",
            email: "test@mail.com",
        };
        authApi.login.mockResolvedValue(mockResponse);
        const success = await useAuthStore
            .getState()
            .login("test@mail.com", "password");
        expect(success).toBe(true);
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(clearCharacterSpy).toHaveBeenCalled();
    });
    it("logout: debe limpiar todo", () => {
        useAuthStore.setState({
            token: "token",
            isAuthenticated: true,
            user: { id: 1 },
        });
        useAuthStore.getState().logout();
        const state = useAuthStore.getState();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(clearCharacterSpy).toHaveBeenCalled();
    });
    it("login: debe manejar errores de credenciales", async () => {
        authApi.login.mockRejectedValue({
            response: { data: { error: "Credenciales inválidas" } },
        });
        const success = await useAuthStore
            .getState()
            .login("error@mail.com", "123");
        expect(success).toBe(false);
        expect(useAuthStore.getState().error).toBe("Credenciales inválidas");
    });
});
