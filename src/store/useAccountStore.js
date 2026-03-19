import { create } from "zustand";
import {
    getProfile,
    updateEmail,
    updateUsername,
    changePassword,
    deleteAccount,
} from "../service/userApi";

const useAccountStore = create((set) => ({
    profile: null,
    isLoading: false,
    isSaving: false,
    error: null,
    success: null,

    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await getProfile();
            set({ profile: data, isLoading: false });
        } catch {
            set({ isLoading: false, error: "Error cargando perfil" });
        }
    },

    saveEmail: async (email) => {
    set({ isSaving: true, error: null, success: null });
    try {
        const data = await updateEmail(email);
        set({
            profile: data,
            isSaving: false,
            success: "Email actualizado — vuelve a iniciar sesión",
        });
        setTimeout(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.reload();
        }, 2000);
    } catch (e) {
        set({
            isSaving: false,
            error: e.response?.data?.error || "Error actualizando email",
        });
    }
},

    saveUsername: async (username) => {
        set({ isSaving: true, error: null, success: null });
        try {
            const data = await updateUsername(username);
            set({
                profile: data,
                isSaving: false,
                success: "Nombre actualizado",
            });
        } catch (e) {
            set({
                isSaving: false,
                error: e.response?.data?.error || "Error actualizando nombre",
            });
        }
    },

    savePassword: async (currentPassword, newPassword) => {
        set({ isSaving: true, error: null, success: null });
        try {
            await changePassword(currentPassword, newPassword);
            set({ isSaving: false, success: "Contraseña actualizada" });
        } catch (e) {
            set({
                isSaving: false,
                error:
                    e.response?.data?.error || "Error actualizando contraseña",
            });
        }
    },

    removeAccount: async (onSuccess) => {
        set({ isSaving: true, error: null });
        try {
            await deleteAccount();
            set({ isSaving: false, profile: null });
            onSuccess?.();
        } catch (e) {
            set({
                isSaving: false,
                error: e.response?.data?.error || "Error eliminando cuenta",
            });
        }
    },

    clearMessages: () => set({ error: null, success: null }),
}));

export default useAccountStore;
