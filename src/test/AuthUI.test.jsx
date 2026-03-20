import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import AuthUI from "../components/organisms/Auth/AuthUI";
import useAuthStore from "../store/useAuthStore";
import { EventBus } from "../game/EventBus";

vi.mock("../store/useAuthStore", () => ({ default: vi.fn() }));
vi.mock("../game/EventBus", () => ({
    EventBus: { emit: vi.fn(), on: vi.fn(), off: vi.fn() },
}));

describe("AuthUI", () => {
    const mockStore = {
        isLoading: false,
        error: null,
        login: vi.fn(),
        register: vi.fn(),
        clearError: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useAuthStore.mockReturnValue(mockStore);
    });

    test("muestra el título CODEFIGHTERS", () => {
        render(<AuthUI onBack={() => {}} onSuccess={() => {}} />);
        expect(screen.getByText("FIGHTERS")).toBeTruthy();
    });

    test("muestra el subtítulo de login por defecto", () => {
        render(<AuthUI onBack={() => {}} onSuccess={() => {}} />);
        expect(screen.getByText("// ACCEDE A TU CUENTA")).toBeTruthy();
    });

    test("cambia a modo register al hacer toggle", () => {
        render(<AuthUI onBack={() => {}} onSuccess={() => {}} />);
        fireEvent.click(screen.getByText("REGÍSTRATE"));
        expect(screen.getByText("// CREA TU CUENTA")).toBeTruthy();
    });

    test("emite user-interacted al hacer toggle", () => {
        render(<AuthUI onBack={() => {}} onSuccess={() => {}} />);
        fireEvent.click(screen.getByText("REGÍSTRATE"));
        expect(EventBus.emit).toHaveBeenCalledWith("user-interacted");
    });

    test("llama a login al hacer submit en modo login", async () => {
        mockStore.login.mockResolvedValue(true);
        render(<AuthUI onBack={() => {}} onSuccess={() => {}} />);
        fireEvent.change(screen.getByPlaceholderText("dev@codefighters.com"), {
            target: { value: "test@test.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("••••••••"), {
            target: { value: "123456" },
        });
        fireEvent.submit(
            screen.getByRole("button", { name: "> ENTRAR" }).closest("form"),
        );
        expect(mockStore.login).toHaveBeenCalledWith("test@test.com", "123456");
    });

    test("llama a onSuccess cuando el login es correcto", async () => {
        mockStore.login.mockResolvedValue(true);
        const onSuccess = vi.fn();
        render(<AuthUI onBack={() => {}} onSuccess={onSuccess} />);
        fireEvent.change(screen.getByPlaceholderText("dev@codefighters.com"), {
            target: { value: "test@test.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("••••••••"), {
            target: { value: "123456" },
        });
        fireEvent.submit(
            screen.getByRole("button", { name: "> ENTRAR" }).closest("form"),
        );
        await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    });

    test("no llama a onSuccess cuando el login falla", async () => {
        mockStore.login.mockResolvedValue(false);
        const onSuccess = vi.fn();
        render(<AuthUI onBack={() => {}} onSuccess={onSuccess} />);
        fireEvent.submit(
            screen.getByRole("button", { name: "> ENTRAR" }).closest("form"),
        );
        await vi.waitFor(() => expect(mockStore.login).toHaveBeenCalled());
        expect(onSuccess).not.toHaveBeenCalled();
    });

    test("llama a onBack al pulsar ← BACK", () => {
        const onBack = vi.fn();
        render(<AuthUI onBack={onBack} onSuccess={() => {}} />);
        fireEvent.click(screen.getByText("← BACK"));
        expect(onBack).toHaveBeenCalledOnce();
    });
});
