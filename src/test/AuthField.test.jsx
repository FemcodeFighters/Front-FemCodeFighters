import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import AuthField from "../components/atoms/AuthField";
import React from 'react';

describe("AuthField", () => {
    test("muestra el label correctamente", () => {
        render(
            <AuthField
                label="Email"
                type="email"
                value=""
                onChange={() => {}}
            />,
        );
        expect(screen.getByText("Email")).toBeTruthy();
    });

    test("renderiza el input con el tipo correcto", () => {
        render(
            <AuthField
                label="Contraseña"
                type="password"
                value=""
                onChange={() => {}}
            />,
        );
        const input = document.querySelector("input");
        expect(input.type).toBe("password");
    });

    test("llama a onChange al escribir", () => {
        const handleChange = vi.fn();
        render(
            <AuthField
                label="Usuario"
                type="text"
                value=""
                onChange={handleChange}
            />,
        );
        fireEvent.change(screen.getByRole("textbox"), {
            target: { value: "jenny" },
        });
        expect(handleChange).toHaveBeenCalledOnce();
    });

    test("respeta los atributos minLength y maxLength", () => {
        render(
            <AuthField
                label="Usuario"
                type="text"
                value=""
                onChange={() => {}}
                minLength={3}
                maxLength={20}
            />,
        );
        const input = screen.getByRole("textbox");
        expect(input.minLength).toBe(3);
        expect(input.maxLength).toBe(20);
    });
});
