export const mask = (value) => {
    const secretKey = 0xabc123;
    return value ^ secretKey;
};

export const unmask = (maskedValue) => {
    const secretKey = 0xabc123;
    return maskedValue ^ secretKey;
};
