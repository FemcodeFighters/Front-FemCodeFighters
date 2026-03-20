import { render, screen, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { EventBus } from "../game/EventBus";
import CombatPopUp from "../components/molecules/CombatPopUp/CombatPopUp";
import React from 'react';

vi.mock("../game/EventBus", () => ({
    EventBus: {
        on: vi.fn(),
        off: vi.fn(),
    },
}));

describe("CombatPopUp", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    test("no renderiza nada al inicio", () => {
        render(<CombatPopUp />);
        expect(screen.queryByText(/./)).toBeNull();
    });

    test("se suscribe al evento player-attack-fired al montar", () => {
        render(<CombatPopUp />);
        expect(EventBus.on).toHaveBeenCalledWith(
            "player-attack-fired",
            expect.any(Function),
        );
    });

    test("muestra el nombre del ataque al recibir el evento", async () => {
        render(<CombatPopUp />);
        const callback = EventBus.on.mock.calls[0][1];
        await act(async () => callback("FIREBALL"));
        expect(screen.getByText("FIREBALL")).toBeTruthy();
    });

    test("se oculta después de 1500ms", async () => {
        render(<CombatPopUp />);
        const callback = EventBus.on.mock.calls[0][1];
        await act(async () => callback("SLASH"));
        await act(async () => vi.advanceTimersByTime(1500));
        expect(screen.queryByText("SLASH")).toBeNull();
    });

    test("se desuscribe del evento al desmontar", () => {
        const { unmount } = render(<CombatPopUp />);
        unmount();
        expect(EventBus.off).toHaveBeenCalledWith(
            "player-attack-fired",
            expect.any(Function),
        );
    });
});
