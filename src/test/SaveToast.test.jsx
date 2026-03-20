import { render, screen, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import SaveToast from "../components/atoms/SaveToast/SaveToast";
import React from 'react';
describe("SaveToast", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    test("no renderiza nada cuando visible es false", () => {
        render(<SaveToast visible={false} onHide={() => {}} />);
        expect(screen.queryByText("DATOS GUARDADOS")).toBeNull();
    });

    test("muestra el toast cuando visible es true", () => {
        render(<SaveToast visible={true} onHide={() => {}} />);
        expect(screen.getByText("DATOS GUARDADOS")).toBeTruthy();
    });

    test("llama a onHide después de 3400ms", async () => {
        const onHide = vi.fn();
        render(<SaveToast visible={true} onHide={onHide} />);

        await act(async () => {
            vi.advanceTimersByTime(3400);
        });

        expect(onHide).toHaveBeenCalledOnce();
    });

    test("desaparece después de 3400ms", async () => {
        render(<SaveToast visible={true} onHide={() => {}} />);

        await act(async () => {
            vi.advanceTimersByTime(3400);
        });

        expect(screen.queryByText("DATOS GUARDADOS")).toBeNull();
    });
});
