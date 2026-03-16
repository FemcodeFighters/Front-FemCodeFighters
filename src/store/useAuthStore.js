import { create } from 'zustand';
import { login as loginApi, register as registerApi } from '../service/authApi';

const useAuthStore = create((set) => ({
    token:           localStorage.getItem('token') || null,
    user:            JSON.parse(localStorage.getItem('user') || 'null'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading:       false,
    error:           null,

    //registro
    register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await registerApi(username, email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id:       data.userId,
                username: data.username,
                email:    data.email,
            }));
            set({
                token:           data.token,
                user:            { id: data.userId, username: data.username, email: data.email },
                isAuthenticated: true,
                isLoading:       false,
            });
            return true;
        } catch (error) {
            set({
                error:     error.response?.data?.error || 'Error al registrarse',
                isLoading: false,
            });
            return false;
        }
    },

    //loguearse
    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await loginApi(email, password);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id:       data.userId,
                username: data.username,
                email:    data.email,
            }));
            set({
                token:           data.token,
                user:            { id: data.userId, username: data.username, email: data.email },
                isAuthenticated: true,
                isLoading:       false,
            });
            return true;
        } catch (error) {
            set({
                error:     error.response?.data?.error || 'Error al iniciar sesión',
                isLoading: false,
            });
            return false;
        }
    },

    // desloguear
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ token: null, user: null, isAuthenticated: false, error: null });
    },

    //limpiar error 
    clearError: () => set({ error: null }),
}));

export default useAuthStore;
