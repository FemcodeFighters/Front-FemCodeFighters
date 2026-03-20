import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "../service/api";
import React from 'react';

vi.mock("axios", () => {
    global.__INTERCEPTOR_STUBS__ = {
        request: null,
        responseError: null,
    };

    return {
        default: {
            create: vi.fn(() => ({
                interceptors: {
                    request: {
                        use: vi.fn((fn) => {
                            global.__INTERCEPTOR_STUBS__.request = fn;
                        }),
                    },
                    response: {
                        use: vi.fn((success, error) => {
                            global.__INTERCEPTOR_STUBS__.responseError = error;
                        }),
                    },
                },
                defaults: { headers: { common: {} } },
            })),
        },
    };
});


describe("API Axios Interceptors", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        Object.defineProperty(window, "location", {
            writable: true,
            configurable: true,
            value: { href: "/" },
        });
    });

    it("debe estar definida la instancia de la API", () => {
        expect(api).toBeDefined();
    });

    it("debe añadir el token si existe en localStorage", () => {
        const requestHandler = global.__INTERCEPTOR_STUBS__.request;
        expect(requestHandler).toBeDefined();

        localStorage.setItem("token", "test-token-123");
        const config = { headers: {} };
        const result = requestHandler(config);

        expect(result.headers.Authorization).toBe("Bearer test-token-123");
    });

    it("debe manejar errores de servidor caído (BACKEND_UNAVAILABLE)", async () => {
        const errorHandler = global.__INTERCEPTOR_STUBS__.responseError;
        expect(errorHandler).toBeDefined();

        const error = { config: { url: "/any" } };

        await expect(errorHandler(error)).rejects.toThrow(
            "BACKEND_UNAVAILABLE",
        );
    });

    it("debe limpiar el token y redirigir con un error 401", async () => {
        const errorHandler = global.__INTERCEPTOR_STUBS__.responseError;

        localStorage.setItem("token", "expired");
        const error401 = {
            config: { url: "/api/test" },
            response: { status: 401 },
        };

        try {
            await errorHandler(error401);
        } catch (e) {}

        expect(localStorage.getItem("token")).toBeNull();
        expect(window.location.href).toBe("/");
    });
});
