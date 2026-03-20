import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../service/api";
import * as userService from "../service/userApi";
import React from 'react';

vi.mock("../service/api", () => ({
    default: {
        get: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

describe("User Profile Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it("getProfile debe obtener los datos del usuario actual", async () => {
        const mockProfile = {
            id: 1,
            username: "player1",
            email: "test@test.com",
        };
        api.get.mockResolvedValue({ data: mockProfile });
        const result = await userService.getProfile();
        expect(api.get).toHaveBeenCalledWith("/api/users/profile");
        expect(result).toEqual(mockProfile);
    });

    it("getAllUsers debe devolver la lista de todos los usuarios", async () => {
        const mockUsers = [
            { id: 1, username: "a" },
            { id: 2, username: "b" },
        ];
        api.get.mockResolvedValue({ data: mockUsers });
        const result = await userService.getAllUsers();
        expect(api.get).toHaveBeenCalledWith("/api/users");
        expect(result).toBe(mockUsers);
    });

    it("updateEmail debe enviar el nuevo email vía PATCH", async () => {
        api.patch.mockResolvedValue({ data: { message: "Email actualizado" } });
        const result = await userService.updateEmail("nuevo@mail.com");
        expect(api.patch).toHaveBeenCalledWith("/api/users/email", {
            email: "nuevo@mail.com",
        });
        expect(result.message).toBe("Email actualizado");
    });

    it("changePassword debe enviar contraseña actual y nueva", async () => {
        api.patch.mockResolvedValue({ data: { success: true } });
        await userService.changePassword("old123", "new456");
        expect(api.patch).toHaveBeenCalledWith("/api/users/password", {
            currentPassword: "old123",
            newPassword: "new456",
        });
    });

    it("deleteAccount debe llamar al método DELETE en la ruta correcta", async () => {
        api.delete.mockResolvedValue({});
        await userService.deleteAccount();
        expect(api.delete).toHaveBeenCalledWith("/api/users");
    });

    it("debe propagar el error si la API falla", async () => {
        api.get.mockRejectedValue(new Error("No autorizado"));
        await expect(userService.getProfile()).rejects.toThrow("No autorizado");
    });
});
