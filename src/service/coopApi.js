import api from "./api";

export const createRoom = async (playerId, maxPlayers) => {
    const response = await api.post("/api/coop/create", {
        playerId,
        maxPlayers,
    });
    return response.data;
};

export const joinRoom = async (roomId, playerId) => {
    const response = await api.post(`/api/coop/join/${roomId}`, { playerId });
    return response.data;
};

export const startCoopGame = async (roomId) => {
    await api.post(`/api/coop/start/${roomId}`);
};

export const getRoomState = async (roomId) => {
    const response = await api.get(`/api/coop/room/${roomId}`);
    return response.data;
};
