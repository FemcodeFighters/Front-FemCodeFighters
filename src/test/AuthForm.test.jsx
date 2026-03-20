import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import AuthForm from "../components/molecules/AuthForm";
import React from 'react';
describe("AuthForm", () => {
    test("muestra el campo USERNAME solo en modo register", () => {
        render(
            <AuthForm
                mode="register"
                onSubmit={() => {}}
                onToggle={() => {}}
                isLoading={false}
                error={null}
            />,
        );
        expect(screen.getByText("USERNAME")).toBeTruthy();
    });

    test("no muestra el campo USERNAME en modo login", () => {
        render(
            <AuthForm
                mode="login"
                onSubmit={() => {}}
                onToggle={() => {}}
                isLoading={false}
                error={null}
            />,
        );
        expect(screen.queryByText("USERNAME")).toBeNull();
    });

    test("muestra el botón ENTRAR en modo login", () => {
        render(
            <AuthForm
                mode="login"
                onSubmit={() => {}}
                onToggle={() => {}}
                isLoading={false}
                error={null}
            />,
        );
        expect(screen.getByText("> ENTRAR")).toBeTruthy();
    });

    test("muestra el botón REGISTRARSE en modo register", () => {
        render(
            <AuthForm
                mode="register"
                onSubmit={() => {}}
                onToggle={() => {}}
                isLoading={false}
                error={null}
            />,
        );
        expect(screen.getByText("> REGISTRARSE")).toBeTruthy();
    });

    test("muestra ... cuando isLoading es true", () => {
        render(
            <AuthForm
                mode="login"
                onSubmit={() => {}}
                onToggle={() => {}}
                isLoading={true}
                error={null}
            />,
        );
        expect(screen.getByText("...")).toBeTruthy();
    });

    test("deshabilita el botón cuando isLoading es true", () => {
        render(
            <AuthForm
                mode="login"
                onSubmit={() => {}}
                onToggle={() => {}}
                isLoading={true}
                error={null}
            />,
        );
        expect(screen.getByRole("button", { name: "..." }).disabled).toBe(true);
    });

    test("muestra el error cuando existe", () => {
        render(
            <AuthForm
                mode="login"
                onSubmit={() => {}}
                onToggle={() => {}}
                isLoading={false}
                error="Credenciales incorrectas"
            />,
        );
        expect(screen.getByText(/Credenciales incorrectas/)).toBeTruthy();
    });

    test("llama a onSubmit con los datos del formulario", () => {
        const handleSubmit = vi.fn();
        render(
            <AuthForm
                mode="login"
                onSubmit={handleSubmit}
                onToggle={() => {}}
                isLoading={false}
                error={null}
            />,
        );

        fireEvent.change(screen.getByPlaceholderText("dev@codefighters.com"), {
            target: { value: "test@test.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("••••••••"), {
            target: { value: "123456" },
        });
        fireEvent.submit(
            screen.getByRole("button", { name: "> ENTRAR" }).closest("form"),
        );

        expect(handleSubmit).toHaveBeenCalledWith({
            username: "",
            email: "test@test.com",
            password: "123456",
        });
    });
});
