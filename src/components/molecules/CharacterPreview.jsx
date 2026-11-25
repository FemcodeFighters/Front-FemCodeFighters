import { useMemo } from "react";
import { generateCharacterFrames } from "./characterSVG";

export default function CharacterPreview({ character, size = 180 }) {
    const src = useMemo(() => {
        const svg = generateCharacterFrames(character, "preview")[0];
        return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    }, [character]);

    const scale = size / 160;

    return (
        <img
            src={src}
            width={Math.round(80 * scale)}
            height={Math.round(160 * scale)}
            alt="Vista previa de tu personaje"
            style={{ display: "block" }}
        />
    );
}