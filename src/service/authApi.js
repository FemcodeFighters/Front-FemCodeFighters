import api from './api';

export const register = async (username, email, password) => {
    const response = await api.post('/api/auth/register', { username, email, password });
    return response.data;
};

export const login = async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
};
