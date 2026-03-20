import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import AuthError from "../components/atoms/AuthError";
import React from 'react';
describe("AuthError", () => {
    test("no renderiza nada si no hay mensaje", () => {
        render(<AuthError message={null} />);
        expect(screen.queryByText(/⚠/)).toBeNull();
    });

    test("muestra el mensaje de error", () => {
        render(<AuthError message="Usuario no encontrado" />);
        expect(screen.getByText(/Usuario no encontrado/)).toBeTruthy();
    });
});
