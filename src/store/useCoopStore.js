import { create } from "zustand";
import { createRoom, joinRoom, startRoom, leaveRoom } from "../service/coopApi";
import { connectToRoom, sendInput, disconnectFromRoom } from "../service/coopSocket";

const MAX_PLAYERS = 4;

const useCoopStore = create((set, get) => ({
    roomId: null,
    gameState: null,
    isConnecting: false,
    error: null,

    createAndJoin: async (playerId) => {
        set({ isConnecting: true, error: null });
        try {
            const roomId = await createRoom(playerId, MAX_PLAYERS);
            get()._connect(roomId);
            return roomId;
        } catch {
            set({ isConnecting: false, error: "No se pudo crear la sala" });
            return null;
        }
    },

    join: async (roomId, playerId) => {
        set({ isConnecting: true, error: null });
        try {
            const state = await joinRoom(roomId, playerId);
            set({ gameState: state });
            get()._connect(roomId);
            return true;
        } catch {
            set({ isConnecting: false, error: "Sala llena o inexistente" });
            return false;
        }
    },

    _connect: (roomId) => {
        connectToRoom(roomId, (state) => set({ gameState: state }));
        set({ roomId, isConnecting: false });
    },

    start: async () => {
        const { roomId } = get();
        if (roomId) await startRoom(roomId);
    },

    sendPlayerInput: (playerId, action, tick) => {
        const { roomId } = get();
        if (roomId) sendInput(roomId, playerId, action, tick);
    },

    leave: async (playerId) => {
        const { roomId } = get();
        disconnectFromRoom();
        if (roomId) {
            try { await leaveRoom(roomId, playerId); } catch { /* best effort */ }
        }
        set({ roomId: null, gameState: null });
    },
}));

export default useCoopStore;