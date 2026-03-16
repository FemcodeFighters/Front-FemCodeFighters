import api from "./api";

export const getCharacter = async () => {
    const response = await api.get("/api/player");
    return response.data;
};

export const updateSkinColor = async (skinColor) => {
    const response = await api.patch("/api/player/skin", { skinColor });
    return response.data;
};

export const updateHair = async (hairStyle, hairColor) => {
    const response = await api.patch("/api/player/hair", {
        hairStyle,
        hairColor,
    });
    return response.data;
};

export const updateEyeColor = async (eyeColor) => {
    const response = await api.patch("/api/player/eyes", { eyeColor });
    return response.data;
};

export const updateOutfit = async (outfit, outfitColor) => {
    const response = await api.patch("/api/player/outfit", {
        outfit,
        outfitColor,
    });
    return response.data;
};

export const updateAccessory = async (accessory) => {
    const response = await api.patch("/api/player/accessory", { accessory });
    return response.data;
};

export const resetCharacter = async () => {
    const response = await api.post("/api/player/reset");
    return response.data;
};
