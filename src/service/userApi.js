import api from "./axios";

export const getProfile = async () => {
    const response = await api.get("/api/users/profile");
    return response.data;
};

export const getAllUsers = async () => {
    const response = await api.get("/api/users");
    return response.data;
};

export const updateEmail = async (email) => {
    const response = await api.patch("/api/users/email", { email });
    return response.data;
};

export const updateUsername = async (username) => {
    const response = await api.patch("/api/users/username", { username });
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.patch("/api/users/password", {
        currentPassword,
        newPassword,
    });
    return response.data;
};

export const deleteAccount = async () => {
    await api.delete("/api/users");
};
