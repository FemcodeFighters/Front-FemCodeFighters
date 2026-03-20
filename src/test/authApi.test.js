import { describe, it, expect, vi, beforeEach } from "vitest";
import { register, login } from "../service/authApi";
import api from "../service/api";
import React from 'react';
vi.mock("../service/api", () => ({
    default: {
        post: vi.fn(),
    },
}));

describe("Servicio de Autenticación", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("register", () => {
        it("debe llamar a /register con los datos correctos y devolver la data", async () => {
            const mockUser = {
                id: 1,
                username: "tester",
                email: "test@test.com",
            };
            api.post.mockResolvedValue({ data: mockUser });
            const result = await register(
                "tester",
                "test@test.com",
                "password123",
            );
            expect(api.post).toHaveBeenCalledWith("/api/auth/register", {
                username: "tester",
                email: "test@test.com",
                password: "password123",
            });
            expect(result).toEqual(mockUser);
        });

        it("debe lanzar un error si el registro falla", async () => {
            api.post.mockRejectedValue(new Error("Email ya existe"));

            await expect(
                register("tester", "test@test.com", "123"),
            ).rejects.toThrow("Email ya existe");
        });
    });

    describe("login", () => {
        it("debe llamar a /login y devolver el token/data de usuario", async () => {
            const mockResponse = { token: "jwt-123", user: { id: 1 } };
            api.post.mockResolvedValue({ data: mockResponse });
            const result = await login("test@test.com", "password123");
            expect(api.post).toHaveBeenCalledWith("/api/auth/login", {
                email: "test@test.com",
                password: "password123",
            });
            expect(result).toBe(mockResponse);
        });

        it("debe fallar si las credenciales son incorrectas", async () => {
            api.post.mockRejectedValue({ response: { status: 401 } });

            await expect(
                login("wrong@test.com", "wrong"),
            ).rejects.toBeDefined();
        });
    });
});
