import api from "./api";

const formatColor = (color) => {
    if (!color || color === "0" || typeof color !== "string") return "#ffffff";
    const clean = color.startsWith("#") ? color : `#${color}`;
    return clean.length === 7 ? clean : "#ffffff";
};

export const getCharacter = async () => {
    try {
        const response = await api.get("/api/player");
        return response.data;
    } catch (error) {
        console.error(
            "No se pudo obtener el personaje del server, usando fallback.",
        );
        return {
            skinColor: "#ffdbac",
            hairStyle: "normal",
            hairColor: "#4a312c",
            eyeColor: "#000000",
            outfit: "basic",
            outfitColor: "#333333",
            accessory: "none",
        };
    }
};

export const updateSkinColor = async (skinColor) => {
    const response = await api.patch("/api/player/skin", {
        skinColor: formatColor(skinColor),
    });
    return response.data;
};

export const updateHair = async (hairStyle, hairColor) => {
    const response = await api.patch("/api/player/hair", {
        hairStyle: hairStyle || "normal",
        hairColor: formatColor(hairColor),
    });
    return response.data;
};

export const updateEyeColor = async (eyeColor) => {
    const response = await api.patch("/api/player/eyes", {
        eyeColor: formatColor(eyeColor),
    });
    return response.data;
};

export const updateOutfit = async (outfit, outfitColor) => {
    const response = await api.patch("/api/player/outfit", {
        outfit: outfit || "basic",
        outfitColor: formatColor(outfitColor),
    });
    return response.data;
};

export const updateAccessory = async (accessory) => {
    const response = await api.patch("/api/player/accessory", {
        accessory: accessory || "none",
    });
    return response.data;
};

export const updateAll = async (character) => {
    const response = await api.patch("/api/player/all", {
        skinColor: formatColor(character.skinColor),
        hairStyle: character.hairStyle || "normal",
        hairColor: formatColor(character.hairColor),
        eyeColor: formatColor(character.eyeColor),
        outfit: character.outfit || "basic",
        outfitColor: formatColor(character.outfitColor),
        accessory: character.accessory || "none",
        ultimateSkill: character.ultimateSkill || "FRIDAY_DEPLOY",
        ultimate_skill: character.ultimateSkill || "FRIDAY_DEPLOY",
    });
    return response.data;
};

export const resetCharacter = async () => {
    const response = await api.post("/api/player/reset");
    return response.data;
};

export const useUltimateSkill = async () => {
    const response = await api.post("/api/player/use-ultimate");
    return response.data;
};

export const getRanking = async () => {
    try {
        const response = await api.get("/api/player/ranking");
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error("Error al obtener ranking:", error);
        return [];
    }
};

export const updateCombatStats = async (won) => {
    try {
        const result = won ? "true" : "false";
        const response = await api.post(
            `/api/player/combat-result/${result}`,
            {},
        );
        return response.data;
    } catch (error) {
        console.error("Error en Stats:", error.response?.data || error.message);
        throw error;
    }
};

export const getUltimateConfig = async () => {
    const response = await api.get("/api/player/ultimate-config");
    return response.data;
};

export const checkBackendHealth = async () => {
    await api.get("/api/health");
    return true;
};

export const getPlayerById = async (playerId) => {
    console.log("Pidiendo personaje al ID:", playerId);
    const response = await api.get(`/api/player/${playerId}/character`);
    return response.data;
};
