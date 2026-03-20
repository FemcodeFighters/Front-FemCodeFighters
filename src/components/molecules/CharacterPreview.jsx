function darken(hex, amount = 30) {
    try {
        const n = parseInt(hex.replace("#", ""), 16);
        const r = Math.max(0, (n >> 16) - amount);
        const g = Math.max(0, ((n >> 8) & 0xff) - amount);
        const b = Math.max(0, (n & 0xff) - amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
    } catch {
        return hex;
    }
}

function lighten(hex, amount = 30) {
    try {
        const n = parseInt(hex.replace("#", ""), 16);
        const r = Math.min(255, (n >> 16) + amount);
        const g = Math.min(255, ((n >> 8) & 0xff) + amount);
        const b = Math.min(255, (n & 0xff) + amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
    } catch {
        return hex;
    }
}

export default function CharacterPreview({ character, size = 180 }) {
    const {
        skinColor = "#f5c5a3",
        hairColor = "#7c3aed",
        hairStyle = "ponytail",
        eyeColor = "#2563eb",
        outfitColor = "#1e1b4b",
        accessory = "none",
        outfit = "hoodie",
    } = character;

    const hairDark = darken(hairColor, 30);
    const eyeDark = darken(eyeColor, 20);
    const outfitLight = lighten(outfitColor, 30);
    const outfitLight2 = lighten(outfitColor, 15);
    const outfitDark = darken(outfitColor, 20);
    const skinDark = darken(skinColor, 20);

    const scale = size / 160;
    const w = Math.round(80 * scale);
    const h = Math.round(160 * scale);

    const TorsoHoodie = () => (
        <>
            <path
                d="M20 24 Q14 20 10 28 Q8 40 12 48 Q16 46 18 36 Q20 28 24 26 Z"
                fill={outfitLight2}
                opacity="0.9"
            />
            <path
                d="M60 24 Q66 20 70 28 Q72 40 68 48 Q64 46 62 36 Q60 28 56 26 Z"
                fill={outfitLight2}
                opacity="0.9"
            />
            <path
                d="M22 68 Q24 60 40 59 Q56 60 58 68 L60 108 Q40 114 20 108 Z"
                fill={outfitColor}
            />
            <path
                d="M30 68 Q40 66 50 68 L51 100 Q40 104 29 100 Z"
                fill={outfitLight}
            />
            <path
                d="M30 88 Q40 86 50 88 L50 100 Q40 103 30 100 Z"
                fill={outfitLight2}
            />
            <line
                x1="40"
                y1="88"
                x2="40"
                y2="102"
                stroke={outfitColor}
                strokeWidth="1"
            />
            <line
                x1="40"
                y1="66"
                x2="40"
                y2="86"
                stroke={outfitColor}
                strokeWidth="1.2"
            />
            <line
                x1="37"
                y1="63"
                x2="34"
                y2="70"
                stroke={hairDark}
                strokeWidth="1"
                opacity="0.6"
            />
            <line
                x1="43"
                y1="63"
                x2="46"
                y2="70"
                stroke={hairDark}
                strokeWidth="1"
                opacity="0.6"
            />
            <rect
                x="22"
                y="104"
                width="36"
                height="5"
                rx="2"
                fill={darken(outfitColor, 10)}
                opacity="0.8"
            />
        </>
    );

    const TorsoJacket = () => (
        <>
            <path
                d="M22 68 Q24 60 40 59 Q56 60 58 68 L60 108 Q40 114 20 108 Z"
                fill={outfitColor}
            />
            <path
                d="M40 62 L28 72 L26 88 L32 88 L34 74 L40 68 Z"
                fill={outfitLight}
            />
            <path
                d="M40 62 L52 72 L54 88 L48 88 L46 74 L40 68 Z"
                fill={outfitLight}
            />
            <line
                x1="40"
                y1="68"
                x2="40"
                y2="108"
                stroke={outfitDark}
                strokeWidth="1.5"
            />
            {[0, 6, 12, 18, 24, 30].map((i) => (
                <g key={i}>
                    <rect
                        x="38"
                        y={72 + i}
                        width="2"
                        height="2"
                        fill={outfitLight2}
                        opacity="0.8"
                    />
                    <rect
                        x="40"
                        y={72 + i}
                        width="2"
                        height="2"
                        fill={outfitLight2}
                        opacity="0.8"
                    />
                </g>
            ))}
            <rect
                x="38"
                y="66"
                width="4"
                height="5"
                rx="1"
                fill={outfitLight}
            />
            <line
                x1="24"
                y1="68"
                x2="30"
                y2="66"
                stroke={outfitLight2}
                strokeWidth="1"
                opacity="0.7"
            />
            <line
                x1="56"
                y1="68"
                x2="50"
                y2="66"
                stroke={outfitLight2}
                strokeWidth="1"
                opacity="0.7"
            />
            <rect
                x="24"
                y="90"
                width="10"
                height="8"
                rx="2"
                fill={outfitLight2}
                opacity="0.6"
            />
            <rect
                x="46"
                y="90"
                width="10"
                height="8"
                rx="2"
                fill={outfitLight2}
                opacity="0.6"
            />
            <rect
                x="22"
                y="104"
                width="36"
                height="5"
                rx="2"
                fill={darken(outfitColor, 10)}
                opacity="0.8"
            />
        </>
    );

    const TorsoArmor = () => (
        <>
            <path
                d="M22 68 Q24 60 40 59 Q56 60 58 68 L60 108 Q40 114 20 108 Z"
                fill={outfitDark}
            />
            <path
                d="M24 66 Q28 62 38 63 L38 84 Q28 86 24 84 Z"
                fill={outfitColor}
            />
            <path
                d="M56 66 Q52 62 42 63 L42 84 Q52 86 56 84 Z"
                fill={outfitColor}
            />
            <rect x="38" y="63" width="4" height="46" fill={outfitDark} />
            <path d="M26 86 L54 86 L52 106 L28 106 Z" fill={outfitColor} />
            <line
                x1="26"
                y1="92"
                x2="54"
                y2="92"
                stroke={outfitDark}
                strokeWidth="1.5"
            />
            <line
                x1="26"
                y1="99"
                x2="54"
                y2="99"
                stroke={outfitDark}
                strokeWidth="1.5"
            />
            <path
                d="M16 64 Q20 58 28 60 L26 72 Q18 74 14 70 Z"
                fill={outfitColor}
            />
            <line
                x1="16"
                y1="67"
                x2="26"
                y2="65"
                stroke={outfitDark}
                strokeWidth="1"
            />
            <path
                d="M64 64 Q60 58 52 60 L54 72 Q62 74 66 70 Z"
                fill={outfitColor}
            />
            <line
                x1="64"
                y1="67"
                x2="54"
                y2="65"
                stroke={outfitDark}
                strokeWidth="1"
            />
            <line
                x1="26"
                y1="70"
                x2="36"
                y2="70"
                stroke={outfitLight}
                strokeWidth="0.8"
                opacity="0.7"
            />
            <line
                x1="30"
                y1="70"
                x2="30"
                y2="76"
                stroke={outfitLight}
                strokeWidth="0.8"
                opacity="0.7"
            />
            <circle cx="30" cy="76" r="1.2" fill={outfitLight} opacity="0.9" />
            <line
                x1="26"
                y1="78"
                x2="36"
                y2="78"
                stroke={outfitLight}
                strokeWidth="0.8"
                opacity="0.5"
            />
            <line
                x1="54"
                y1="70"
                x2="44"
                y2="70"
                stroke={outfitLight}
                strokeWidth="0.8"
                opacity="0.7"
            />
            <line
                x1="50"
                y1="70"
                x2="50"
                y2="76"
                stroke={outfitLight}
                strokeWidth="0.8"
                opacity="0.7"
            />
            <circle cx="50" cy="76" r="1.2" fill={outfitLight} opacity="0.9" />
            <line
                x1="54"
                y1="78"
                x2="44"
                y2="78"
                stroke={outfitLight}
                strokeWidth="0.8"
                opacity="0.5"
            />
            <ellipse
                cx="40"
                cy="74"
                rx="4"
                ry="4"
                fill={outfitLight}
                opacity="0.3"
            />
            <ellipse
                cx="40"
                cy="74"
                rx="2"
                ry="2"
                fill={outfitLight}
                opacity="0.8"
            />
            <rect
                x="22"
                y="104"
                width="36"
                height="5"
                rx="2"
                fill={darken(outfitColor, 15)}
                opacity="0.9"
            />
        </>
    );

    const TorsoComponent =
        outfit === "jacket"
            ? TorsoJacket
            : outfit === "armor"
              ? TorsoArmor
              : TorsoHoodie;

    return (
        <svg
            width={w}
            height={h}
            viewBox="0 0 80 160"
            style={{ display: "block" }}
        >
            <ellipse
                cx="40"
                cy="156"
                rx="22"
                ry="4"
                fill={hairColor}
                opacity="0.2"
            />

            <path
                d="M30 108 Q26 124 25 142 Q28 146 32 142 Q34 126 36 108 Z"
                fill={outfitColor}
            />
            <ellipse cx="27" cy="144" rx="6" ry="3.5" fill="#0f0f1a" />
            <path
                d="M50 108 Q54 124 55 142 Q52 146 48 142 Q46 126 44 108 Z"
                fill={outfitColor}
            />
            <ellipse cx="53" cy="144" rx="6" ry="3.5" fill="#0f0f1a" />

            <TorsoComponent />

            <rect x="36" y="54" width="8" height="8" rx="2" fill={skinColor} />

            <path
                d="M22 69 Q12 75 10 94 Q14 100 18 96 L24 72 Z"
                fill={outfitColor}
            />
            <ellipse cx="12" cy="97" rx="6" ry="6" fill={skinColor} />
            <path
                d="M8 94 Q12 90 16 94 Q14 100 12 100 Q9 100 8 94Z"
                fill={outfitLight}
                opacity="0.7"
            />
            {outfit === "armor" && (
                <ellipse
                    cx="22"
                    cy="67"
                    rx="5"
                    ry="3"
                    fill={outfitColor}
                    opacity="0.9"
                />
            )}

            <path
                d="M58 69 Q68 75 70 94 Q66 100 62 96 L56 72 Z"
                fill={outfitColor}
            />
            <ellipse cx="68" cy="97" rx="6" ry="6" fill={skinColor} />
            <path
                d="M64 94 Q68 90 72 94 Q71 100 68 100 Q65 100 64 94Z"
                fill={outfitLight}
                opacity="0.7"
            />
            {outfit === "armor" && (
                <ellipse
                    cx="58"
                    cy="67"
                    rx="5"
                    ry="3"
                    fill={outfitColor}
                    opacity="0.9"
                />
            )}

            <ellipse cx="40" cy="36" rx="20" ry="22" fill={skinColor} />
            <ellipse cx="22" cy="36" rx="3" ry="4" fill={skinColor} />
            <ellipse cx="58" cy="36" rx="3" ry="4" fill={skinColor} />
            <ellipse
                cx="27"
                cy="40"
                rx="6"
                ry="4"
                fill="#ffb3a0"
                opacity="0.35"
            />
            <ellipse
                cx="53"
                cy="40"
                rx="6"
                ry="4"
                fill="#ffb3a0"
                opacity="0.35"
            />

            <ellipse cx="32" cy="34" rx="6" ry="7" fill="#fff" />
            <ellipse cx="32" cy="35" rx="4.5" ry="5.5" fill={eyeColor} />
            <ellipse cx="32" cy="36" rx="3" ry="3.5" fill={eyeDark} />
            <circle cx="32" cy="36" r="2" fill="#0a0a0a" />
            <ellipse
                cx="30"
                cy="32"
                rx="1.8"
                ry="1.2"
                fill="#fff"
                opacity="0.9"
            />
            <ellipse
                cx="34"
                cy="33"
                rx="0.8"
                ry="0.6"
                fill="#fff"
                opacity="0.7"
            />

            <ellipse cx="48" cy="34" rx="6" ry="7" fill="#fff" />
            <ellipse cx="48" cy="35" rx="4.5" ry="5.5" fill={eyeColor} />
            <ellipse cx="48" cy="36" rx="3" ry="3.5" fill={eyeDark} />
            <circle cx="48" cy="36" r="2" fill="#0a0a0a" />
            <ellipse
                cx="46"
                cy="32"
                rx="1.8"
                ry="1.2"
                fill="#fff"
                opacity="0.9"
            />
            <ellipse
                cx="50"
                cy="33"
                rx="0.8"
                ry="0.6"
                fill="#fff"
                opacity="0.7"
            />

            <path
                d="M26 29 Q32 26 38 29"
                stroke="#0a0a0a"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M42 29 Q48 26 54 29"
                stroke="#0a0a0a"
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
            />
            <path
                d="M27 40 Q32 42 37 40"
                stroke="#0a0a0a"
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
                opacity="0.5"
            />
            <path
                d="M43 40 Q48 42 53 40"
                stroke="#0a0a0a"
                strokeWidth="0.8"
                fill="none"
                strokeLinecap="round"
                opacity="0.5"
            />
            <path
                d="M39 42 Q40 44 41 42"
                stroke={skinDark}
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                opacity="0.6"
            />
            <path
                d="M35 47 Q40 51 45 47"
                stroke={skinDark}
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
            />

            <ellipse cx="40" cy="22" rx="22" ry="10" fill={hairColor} />
            <rect x="18" y="24" width="44" height="4" fill={hairColor} />
            <rect
                x="20"
                y="26"
                width="40"
                height="2"
                fill={hairDark}
                opacity="0.6"
            />

            {hairStyle === "ponytail" && (
                <>
                    <path
                        d="M56 18 Q68 12 72 22 Q74 32 68 36 Q62 34 58 26 Z"
                        fill={hairColor}
                    />
                    <path
                        d="M66 34 Q74 44 72 56 Q68 58 64 52 Q66 42 64 36 Z"
                        fill={hairDark}
                    />
                </>
            )}
            {hairStyle === "twintails" && (
                <>
                    <path
                        d="M20 24 Q8 18 4 30 Q2 44 10 50 Q16 48 16 36 Q16 26 22 22 Z"
                        fill={hairColor}
                    />
                    <path
                        d="M10 48 Q6 60 8 72 Q12 74 14 66 Q12 56 12 48 Z"
                        fill={hairDark}
                    />
                    <path
                        d="M60 24 Q72 18 76 30 Q78 44 70 50 Q64 48 64 36 Q64 26 58 22 Z"
                        fill={hairColor}
                    />
                    <path
                        d="M70 48 Q74 60 72 72 Q68 74 66 66 Q68 56 68 48 Z"
                        fill={hairDark}
                    />
                </>
            )}
            {hairStyle === "pixie" && (
                <>
                    <path
                        d="M22 20 Q20 11 26 9 Q28 15 24 20 Z"
                        fill={hairDark}
                    />
                    <path
                        d="M33 16 Q34 7 40 7 Q41 13 37 17 Z"
                        fill={hairColor}
                    />
                    <path
                        d="M46 15 Q48 6 54 8 Q52 14 48 18 Z"
                        fill={hairDark}
                    />
                    <path
                        d="M54 18 Q58 10 63 13 Q61 19 56 21 Z"
                        fill={hairColor}
                    />
                </>
            )}
            {hairStyle === "long" && (
                <>
                    <path
                        d="M20 26 Q10 42 8 68 Q10 84 14 94 Q18 90 18 76 Q16 58 20 40 Z"
                        fill={hairColor}
                    />
                    <path d="M8 68 Q4 76 8 84 Q12 76 8 68" fill={hairDark} />
                    <path
                        d="M14 94 Q10 104 14 112 Q18 104 14 94"
                        fill={hairColor}
                    />
                    <path
                        d="M60 26 Q70 42 72 68 Q70 84 66 94 Q62 90 62 76 Q64 58 60 40 Z"
                        fill={hairColor}
                    />
                    <path
                        d="M72 68 Q76 76 72 84 Q68 76 72 68"
                        fill={hairDark}
                    />
                    <path
                        d="M66 94 Q70 104 66 112 Q62 104 66 94"
                        fill={hairColor}
                    />
                </>
            )}
            {hairStyle === "bun" && (
                <>
                    <ellipse cx="30" cy="11" rx="10" ry="9" fill={hairColor} />
                    <ellipse cx="30" cy="11" rx="6" ry="5.5" fill={hairDark} />
                    <rect
                        x="26"
                        y="16"
                        width="8"
                        height="6"
                        rx="2"
                        fill={hairDark}
                    />
                    <ellipse cx="50" cy="11" rx="10" ry="9" fill={hairColor} />
                    <ellipse cx="50" cy="11" rx="6" ry="5.5" fill={hairDark} />
                    <rect
                        x="46"
                        y="16"
                        width="8"
                        height="6"
                        rx="2"
                        fill={hairDark}
                    />
                </>
            )}
            {hairStyle === "braids" && (
                <>
                    <path
                        d="M20 26 Q14 34 12 50 Q16 52 18 48 Q16 36 22 28 Z"
                        fill={hairDark}
                    />
                    <ellipse cx="14" cy="54" rx="4" ry="5" fill={hairColor} />
                    <ellipse cx="16" cy="64" rx="4" ry="5" fill={hairDark} />
                    <ellipse cx="14" cy="74" rx="4" ry="5" fill={hairColor} />
                    <ellipse cx="16" cy="84" rx="3" ry="4" fill={hairDark} />
                    <path
                        d="M60 26 Q66 34 68 50 Q64 52 62 48 Q64 36 58 28 Z"
                        fill={hairDark}
                    />
                    <ellipse cx="66" cy="54" rx="4" ry="5" fill={hairColor} />
                    <ellipse cx="64" cy="64" rx="4" ry="5" fill={hairDark} />
                    <ellipse cx="66" cy="74" rx="4" ry="5" fill={hairColor} />
                    <ellipse cx="64" cy="84" rx="3" ry="4" fill={hairDark} />
                </>
            )}

            {accessory === "glasses" && (
                <>
                    <rect
                        x="24"
                        y="29"
                        width="12"
                        height="9"
                        rx="3"
                        fill="none"
                        stroke="#00ffc8"
                        strokeWidth="1.5"
                    />
                    <rect
                        x="44"
                        y="29"
                        width="12"
                        height="9"
                        rx="3"
                        fill="none"
                        stroke="#00ffc8"
                        strokeWidth="1.5"
                    />
                    <line
                        x1="36"
                        y1="33"
                        x2="44"
                        y2="33"
                        stroke="#00ffc8"
                        strokeWidth="1.5"
                    />
                    <line
                        x1="22"
                        y1="33"
                        x2="24"
                        y2="33"
                        stroke="#00ffc8"
                        strokeWidth="1.5"
                    />
                    <line
                        x1="56"
                        y1="33"
                        x2="58"
                        y2="33"
                        stroke="#00ffc8"
                        strokeWidth="1.5"
                    />
                </>
            )}
            {accessory === "hat" && (
                <>
                    <rect
                        x="22"
                        y="12"
                        width="36"
                        height="5"
                        rx="2"
                        fill="#1f2937"
                    />
                    <rect
                        x="28"
                        y="2"
                        width="24"
                        height="12"
                        rx="3"
                        fill="#1f2937"
                    />
                    <line
                        x1="28"
                        y1="8"
                        x2="52"
                        y2="8"
                        stroke="#374151"
                        strokeWidth="1"
                    />
                </>
            )}
            {accessory === "mask" && (
                <path
                    d="M26 40 Q28 52 40 54 Q52 52 54 40 Q47 44 40 44 Q33 44 26 40Z"
                    fill="#00ffc8"
                    opacity="0.75"
                />
            )}
            {accessory === "headphones" && (
                <>
                    <path
                        d="M20 28 Q20 10 40 10 Q60 10 60 28"
                        stroke="#1f2937"
                        strokeWidth="3"
                        fill="none"
                    />
                    <rect
                        x="16"
                        y="26"
                        width="8"
                        height="12"
                        rx="3"
                        fill="#1f2937"
                    />
                    <rect
                        x="56"
                        y="26"
                        width="8"
                        height="12"
                        rx="3"
                        fill="#1f2937"
                    />
                </>
            )}
        </svg>
    );
}
