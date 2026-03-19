import { create } from "zustand";
import { login as loginApi, register as registerApi } from "../service/authApi";
import useCharacterStore from "./useCharacterStore";

const useAuthStore = create((set) => ({
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user") || "null"),
    isAuthenticated: !!localStorage.getItem("token"),
    isLoading: false,
    error: null,

    register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await registerApi(username, email, password);
            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: data.userId,
                    username: data.username,
                    email: data.email,
                }),
            );
            set({
                token: data.token,
                user: {
                    id: data.userId,
                    username: data.username,
                    email: data.email,
                },
                isAuthenticated: true,
                isLoading: false,
            });
            const { clearCharacter } = useCharacterStore.getState();
            clearCharacter();
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.error || "Error al registrarse",
                isLoading: false,
            });
            return false;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await loginApi(email, password);
            localStorage.setItem("token", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: data.userId,
                    username: data.username,
                    email: data.email,
                }),
            );
            set({
                token: data.token,
                user: {
                    id: data.userId,
                    username: data.username,
                    email: data.email,
                },
                isAuthenticated: true,
                isLoading: false,
            });
            const { clearCharacter } = useCharacterStore.getState();
            clearCharacter();
            return true;
        } catch (error) {
            set({
                error: error.response?.data?.error || "Error al iniciar sesión",
                isLoading: false,
            });
            return false;
        }
    },

    logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null, isAuthenticated: false, error: null });
    const { clearCharacter } = useCharacterStore.getState();
    clearCharacter();
},

    clearError: () => set({ error: null }),
}));

export default useAuthStore;
