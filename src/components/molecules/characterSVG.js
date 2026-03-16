// Genera el SVG del personaje como string — usable en React y Phaser

function darken(hex, amount = 30) {
    try {
        const n = parseInt(hex.replace('#', ''), 16);
        const r = Math.max(0, (n >> 16) - amount);
        const g = Math.max(0, ((n >> 8) & 0xff) - amount);
        const b = Math.max(0, (n & 0xff) - amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    } catch { return hex; }
}

function lighten(hex, amount = 30) {
    try {
        const n = parseInt(hex.replace('#', ''), 16);
        const r = Math.min(255, (n >> 16) + amount);
        const g = Math.min(255, ((n >> 8) & 0xff) + amount);
        const b = Math.min(255, (n & 0xff) + amount);
        return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    } catch { return hex; }
}

export function generateCharacterSVG(character = {}) {
    const {
        skinColor   = '#f5c5a3',
        hairColor   = '#7c3aed',
        hairStyle   = 'ponytail',
        eyeColor    = '#2563eb',
        outfitColor = '#1e1b4b',
        accessory   = 'none',
    } = character;

    const hairDark    = darken(hairColor, 30);
    const eyeDark     = darken(eyeColor, 20);
    const outfitLight = lighten(outfitColor, 30);
    const skinDark    = darken(skinColor, 20);
    const browColor   = darken(skinColor, 40);

    const hairStyles = {
        ponytail: `
            <path d="M56 18 Q68 12 72 22 Q74 32 68 36 Q62 34 58 26 Z" fill="${hairColor}"/>
            <path d="M66 34 Q74 44 72 56 Q68 58 64 52 Q66 42 64 36 Z" fill="${hairDark}"/>
        `,
        twintails: `
            <path d="M20 24 Q8 18 4 30 Q2 44 10 50 Q16 48 16 36 Q16 26 22 22 Z" fill="${hairColor}"/>
            <path d="M10 48 Q6 60 8 72 Q12 74 14 66 Q12 56 12 48 Z" fill="${hairDark}"/>
            <path d="M60 24 Q72 18 76 30 Q78 44 70 50 Q64 48 64 36 Q64 26 58 22 Z" fill="${hairColor}"/>
            <path d="M70 48 Q74 60 72 72 Q68 74 66 66 Q68 56 68 48 Z" fill="${hairDark}"/>
        `,
        pixie: `
            <path d="M22 20 Q20 11 26 9 Q28 15 24 20 Z" fill="${hairDark}"/>
            <path d="M33 16 Q34 7 40 7 Q41 13 37 17 Z" fill="${hairColor}"/>
            <path d="M46 15 Q48 6 54 8 Q52 14 48 18 Z" fill="${hairDark}"/>
            <path d="M54 18 Q58 10 63 13 Q61 19 56 21 Z" fill="${hairColor}"/>
        `,
        long: `
            <path d="M20 26 Q10 42 8 68 Q10 84 14 94 Q18 90 18 76 Q16 58 20 40 Z" fill="${hairColor}"/>
            <path d="M8 68 Q4 76 8 84 Q12 76 8 68" fill="${hairDark}"/>
            <path d="M14 94 Q10 104 14 112 Q18 104 14 94" fill="${hairColor}"/>
            <path d="M60 26 Q70 42 72 68 Q70 84 66 94 Q62 90 62 76 Q64 58 60 40 Z" fill="${hairColor}"/>
            <path d="M72 68 Q76 76 72 84 Q68 76 72 68" fill="${hairDark}"/>
            <path d="M66 94 Q70 104 66 112 Q62 104 66 94" fill="${hairColor}"/>
        `,
        bun: `
            <ellipse cx="30" cy="11" rx="10" ry="9" fill="${hairColor}"/>
            <ellipse cx="30" cy="11" rx="6" ry="5.5" fill="${hairDark}"/>
            <rect x="26" y="16" width="8" height="6" rx="2" fill="${hairDark}"/>
            <ellipse cx="50" cy="11" rx="10" ry="9" fill="${hairColor}"/>
            <ellipse cx="50" cy="11" rx="6" ry="5.5" fill="${hairDark}"/>
            <rect x="46" y="16" width="8" height="6" rx="2" fill="${hairDark}"/>
        `,
        braids: `
            <path d="M20 26 Q14 34 12 50 Q16 52 18 48 Q16 36 22 28 Z" fill="${hairDark}"/>
            <ellipse cx="14" cy="54" rx="4" ry="5" fill="${hairColor}"/>
            <ellipse cx="16" cy="64" rx="4" ry="5" fill="${hairDark}"/>
            <ellipse cx="14" cy="74" rx="4" ry="5" fill="${hairColor}"/>
            <ellipse cx="16" cy="84" rx="3" ry="4" fill="${hairDark}"/>
            <path d="M60 26 Q66 34 68 50 Q64 52 62 48 Q64 36 58 28 Z" fill="${hairDark}"/>
            <ellipse cx="66" cy="54" rx="4" ry="5" fill="${hairColor}"/>
            <ellipse cx="64" cy="64" rx="4" ry="5" fill="${hairDark}"/>
            <ellipse cx="66" cy="74" rx="4" ry="5" fill="${hairColor}"/>
            <ellipse cx="64" cy="84" rx="3" ry="4" fill="${hairDark}"/>
        `,
    };

    const accessories = {
        none: '',
        glasses: `
            <rect x="24" y="29" width="12" height="9" rx="3" fill="none" stroke="#00ffc8" stroke-width="1.5"/>
            <rect x="44" y="29" width="12" height="9" rx="3" fill="none" stroke="#00ffc8" stroke-width="1.5"/>
            <line x1="36" y1="33" x2="44" y2="33" stroke="#00ffc8" stroke-width="1.5"/>
            <line x1="22" y1="33" x2="24" y2="33" stroke="#00ffc8" stroke-width="1.5"/>
            <line x1="56" y1="33" x2="58" y2="33" stroke="#00ffc8" stroke-width="1.5"/>
        `,
        hat: `
            <rect x="22" y="12" width="36" height="5" rx="2" fill="#1f2937"/>
            <rect x="28" y="2" width="24" height="12" rx="3" fill="#1f2937"/>
            <line x1="28" y1="8" x2="52" y2="8" stroke="#374151" stroke-width="1"/>
        `,
        mask: `
            <path d="M26 40 Q28 52 40 54 Q52 52 54 40 Q47 44 40 44 Q33 44 26 40Z" fill="#00ffc8" opacity="0.75"/>
        `,
        headphones: `
            <path d="M20 28 Q20 10 40 10 Q60 10 60 28" stroke="#1f2937" stroke-width="3" fill="none"/>
            <rect x="16" y="26" width="8" height="12" rx="3" fill="#1f2937"/>
            <rect x="56" y="26" width="8" height="12" rx="3" fill="#1f2937"/>
        `,
    };

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 160" width="80" height="160">
        <!-- Sombra -->
        <ellipse cx="40" cy="156" rx="22" ry="4" fill="${hairColor}" opacity="0.2"/>
        <!-- Piernas -->
        <path d="M30 108 Q26 124 25 142 Q28 146 32 142 Q34 126 36 108 Z" fill="${outfitColor}"/>
        <ellipse cx="27" cy="144" rx="6" ry="3.5" fill="#0f0f1a"/>
        <path d="M50 108 Q54 124 55 142 Q52 146 48 142 Q46 126 44 108 Z" fill="${outfitColor}"/>
        <ellipse cx="53" cy="144" rx="6" ry="3.5" fill="#0f0f1a"/>
        <!-- Torso -->
        <path d="M22 68 Q24 60 40 59 Q56 60 58 68 L60 108 Q40 114 20 108 Z" fill="${outfitColor}"/>
        <path d="M30 68 Q40 66 50 68 L51 100 Q40 104 29 100 Z" fill="${outfitLight}"/>
        <line x1="40" y1="66" x2="40" y2="102" stroke="${outfitColor}" stroke-width="1.2"/>
        <rect x="22" y="98" width="36" height="5" rx="2" fill="${darken(outfitColor, 10)}" opacity="0.8"/>
        <!-- Cuello -->
        <rect x="36" y="54" width="8" height="8" rx="2" fill="${skinColor}"/>
        <!-- Brazo izquierdo -->
        <path d="M22 69 Q12 75 10 94 Q14 100 18 96 L24 72 Z" fill="${outfitColor}"/>
        <ellipse cx="12" cy="97" rx="6" ry="6" fill="${skinColor}"/>
        <path d="M8 94 Q12 90 16 94 Q14 100 12 100 Q9 100 8 94Z" fill="${outfitLight}" opacity="0.7"/>
        <!-- Brazo derecho -->
        <path d="M58 69 Q68 75 70 94 Q66 100 62 96 L56 72 Z" fill="${outfitColor}"/>
        <ellipse cx="68" cy="97" rx="6" ry="6" fill="${skinColor}"/>
        <path d="M64 94 Q68 90 72 94 Q71 100 68 100 Q65 100 64 94Z" fill="${outfitLight}" opacity="0.7"/>
        <!-- Cabeza -->
        <ellipse cx="40" cy="36" rx="20" ry="22" fill="${skinColor}"/>
        <ellipse cx="22" cy="36" rx="3" ry="4" fill="${skinColor}"/>
        <ellipse cx="58" cy="36" rx="3" ry="4" fill="${skinColor}"/>
        <ellipse cx="27" cy="40" rx="6" ry="4" fill="#ffb3a0" opacity="0.35"/>
        <ellipse cx="53" cy="40" rx="6" ry="4" fill="#ffb3a0" opacity="0.35"/>
        <!-- Ojo izquierdo -->
        <ellipse cx="32" cy="34" rx="6" ry="7" fill="#fff"/>
        <ellipse cx="32" cy="35" rx="4.5" ry="5.5" fill="${eyeColor}"/>
        <ellipse cx="32" cy="36" rx="3" ry="3.5" fill="${eyeDark}"/>
        <circle cx="32" cy="36" r="2" fill="#0a0a0a"/>
        <ellipse cx="30" cy="32" rx="1.8" ry="1.2" fill="#fff" opacity="0.9"/>
        <path d="M26 29 Q32 26 38 29" stroke="#0a0a0a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <!-- Ojo derecho -->
        <ellipse cx="48" cy="34" rx="6" ry="7" fill="#fff"/>
        <ellipse cx="48" cy="35" rx="4.5" ry="5.5" fill="${eyeColor}"/>
        <ellipse cx="48" cy="36" rx="3" ry="3.5" fill="${eyeDark}"/>
        <circle cx="48" cy="36" r="2" fill="#0a0a0a"/>
        <ellipse cx="46" cy="32" rx="1.8" ry="1.2" fill="#fff" opacity="0.9"/>
        <path d="M42 29 Q48 26 54 29" stroke="#0a0a0a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <!-- Cejas -->
        <path d="M26 27 Q32 24 38 27" stroke="${browColor}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M42 27 Q48 24 54 27" stroke="${browColor}" stroke-width="2" fill="none" stroke-linecap="round"/>
        <!-- Nariz y boca -->
        <path d="M39 42 Q40 44 41 42" stroke="${skinDark}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/>
        <path d="M35 47 Q40 51 45 47" stroke="${skinDark}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <!-- Pelo base -->
        <ellipse cx="40" cy="22" rx="22" ry="10" fill="${hairColor}"/>
        <rect x="18" y="24" width="44" height="4" fill="${hairColor}"/>
        <rect x="20" y="26" width="40" height="2" fill="${hairDark}" opacity="0.6"/>
        <!-- Peinado -->
        ${hairStyles[hairStyle] || hairStyles.ponytail}
        <!-- Accesorio -->
        ${accessories[accessory] || ''}
    </svg>`;
}

// ── Generador de frames de animación ─────────────────────────────────────────
export function generateCharacterFrames(character = {}, anim = 'idle') {
    const {
        skinColor   = '#f5c5a3',
        hairColor   = '#7c3aed',
        hairStyle   = 'ponytail',
        eyeColor    = '#2563eb',
        outfitColor = '#1e1b4b',
        accessory   = 'none',
    } = character;

    const hd  = darken(hairColor, 30);
    const ol  = lighten(outfitColor, 30);
    const sd  = darken(skinColor, 20);
    const brow = darken(skinColor, 40);
    const ed  = darken(eyeColor, 20);

    const wrap = (content) =>
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 160" width="80" height="160">${content}</svg>`;

    // ── Partes reutilizables ──────────────────────────────────────────────
const shadow = '';
    const torso = (oy = 0) => `
        <rect x="36" y="${54 + oy}" width="8" height="8" rx="2" fill="${skinColor}"/>
        <path d="M22 ${68+oy} Q24 ${60+oy} 40 ${59+oy} Q56 ${60+oy} 58 ${68+oy} L60 ${108+oy} Q40 ${114+oy} 20 ${108+oy} Z" fill="${outfitColor}"/>
        <path d="M30 ${68+oy} Q40 ${66+oy} 50 ${68+oy} L51 ${100+oy} Q40 ${104+oy} 29 ${100+oy} Z" fill="${ol}"/>
        <line x1="40" y1="${66+oy}" x2="40" y2="${102+oy}" stroke="${outfitColor}" stroke-width="1.2"/>
        <rect x="22" y="${98+oy}" width="36" height="5" rx="2" fill="${darken(outfitColor,10)}" opacity="0.8"/>
    `;

    const armL = (angle = 0, oy = 0) => {
        const rad = angle * Math.PI / 180;
        const ax = 22, ay = 69 + oy, len = 28;
        const ex = Math.round(ax + Math.sin(rad) * len - Math.cos(rad) * 8);
        const ey = Math.round(ay + Math.cos(rad) * len + Math.sin(rad) * 4);
        return `
            <path d="M${ax} ${ay} Q${ax-10+Math.round(Math.sin(rad)*8)} ${ay+14} ${ex} ${ey} L${ex+6} ${ey-4} L${ax+2} ${ay-4} Z" fill="${outfitColor}"/>
            <ellipse cx="${ex}" cy="${ey}" rx="6" ry="6" fill="${skinColor}"/>
            <path d="${ex-4} ${ey-4} Q${ex} ${ey-8} ${ex+4} ${ey-4} Q${ex+2} ${ey+2} ${ex} ${ey+2} Q${ex-2} ${ey+2} ${ex-4} ${ey-4}Z" fill="${ol}" opacity="0.7"/>
        `;
    };

    const armR = (angle = 0, oy = 0) => {
        const rad = angle * Math.PI / 180;
        const ax = 58, ay = 69 + oy, len = 28;
        const ex = Math.round(ax + Math.sin(rad) * len + Math.cos(rad) * 8);
        const ey = Math.round(ay + Math.cos(rad) * len - Math.sin(rad) * 4);
        return `
            <path d="M${ax} ${ay} Q${ax+10+Math.round(Math.sin(rad)*8)} ${ay+14} ${ex} ${ey} L${ex-6} ${ey-4} L${ax-2} ${ay-4} Z" fill="${outfitColor}"/>
            <ellipse cx="${ex}" cy="${ey}" rx="6" ry="6" fill="${skinColor}"/>
            <path d="${ex-4} ${ey-4} Q${ex} ${ey-8} ${ex+4} ${ey-4} Q${ex+2} ${ey+2} ${ex} ${ey+2} Q${ex-2} ${ey+2} ${ex-4} ${ey-4}Z" fill="${ol}" opacity="0.7"/>
        `;
    };

    const legsIdle = `
        <path d="M30 108 Q26 124 25 142 Q28 146 32 142 Q34 126 36 108 Z" fill="${outfitColor}"/>
        <ellipse cx="27" cy="144" rx="6" ry="3.5" fill="#0f0f1a"/>
        <path d="M50 108 Q54 124 55 142 Q52 146 48 142 Q46 126 44 108 Z" fill="${outfitColor}"/>
        <ellipse cx="53" cy="144" rx="6" ry="3.5" fill="#0f0f1a"/>
    `;

    const headBase = (oy = 0, expr = 'normal') => {
        const eyebrowL = expr === 'hurt'
            ? `<path d="M28 ${32+oy} L38 ${36+oy}" stroke="#0a0a0a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
            : `<path d="M26 ${29+oy} Q32 ${26+oy} 38 ${29+oy}" stroke="#0a0a0a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
        const eyebrowR = expr === 'hurt'
            ? `<path d="M42 ${36+oy} L52 ${32+oy}" stroke="#0a0a0a" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
            : `<path d="M42 ${29+oy} Q48 ${26+oy} 54 ${29+oy}" stroke="#0a0a0a" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
        const mouth = expr === 'hurt'
            ? `<path d="M34 ${48+oy} Q40 ${45+oy} 46 ${48+oy}" stroke="${sd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`
            : `<path d="M35 ${47+oy} Q40 ${51+oy} 45 ${47+oy}" stroke="${sd}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;

        return `
            <ellipse cx="40" cy="${36+oy}" rx="20" ry="22" fill="${skinColor}"/>
            <ellipse cx="22" cy="${36+oy}" rx="3" ry="4" fill="${skinColor}"/>
            <ellipse cx="58" cy="${36+oy}" rx="3" ry="4" fill="${skinColor}"/>
            <ellipse cx="27" cy="${40+oy}" rx="6" ry="4" fill="#ffb3a0" opacity="0.35"/>
            <ellipse cx="53" cy="${40+oy}" rx="6" ry="4" fill="#ffb3a0" opacity="0.35"/>
            <ellipse cx="32" cy="${34+oy}" rx="6" ry="7" fill="#fff"/>
            <ellipse cx="32" cy="${35+oy}" rx="4.5" ry="5.5" fill="${eyeColor}"/>
            <ellipse cx="32" cy="${36+oy}" rx="3" ry="3.5" fill="${ed}"/>
            <circle cx="32" cy="${36+oy}" r="2" fill="#0a0a0a"/>
            <ellipse cx="30" cy="${32+oy}" rx="1.8" ry="1.2" fill="#fff" opacity="0.9"/>
            <ellipse cx="48" cy="${34+oy}" rx="6" ry="7" fill="#fff"/>
            <ellipse cx="48" cy="${35+oy}" rx="4.5" ry="5.5" fill="${eyeColor}"/>
            <ellipse cx="48" cy="${36+oy}" rx="3" ry="3.5" fill="${ed}"/>
            <circle cx="48" cy="${36+oy}" r="2" fill="#0a0a0a"/>
            <ellipse cx="46" cy="${32+oy}" rx="1.8" ry="1.2" fill="#fff" opacity="0.9"/>
            ${eyebrowL}${eyebrowR}
            <path d="M39 ${42+oy} Q40 ${44+oy} 41 ${42+oy}" stroke="${sd}" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.6"/>
            ${mouth}
            <ellipse cx="40" cy="${22+oy}" rx="22" ry="10" fill="${hairColor}"/>
            <rect x="18" y="${24+oy}" width="44" height="4" fill="${hairColor}"/>
            <rect x="20" y="${26+oy}" width="40" height="2" fill="${hd}" opacity="0.6"/>
            <path d="M56 ${18+oy} Q68 ${12+oy} 72 ${22+oy} Q74 ${32+oy} 68 ${36+oy} Q62 ${34+oy} 58 ${26+oy} Z" fill="${hairColor}"/>
            <path d="M66 ${34+oy} Q74 ${44+oy} 72 ${56+oy} Q68 ${58+oy} 64 ${52+oy} Q66 ${42+oy} 64 ${36+oy} Z" fill="${hd}"/>
        `;
    };

    // ── Definición de frames por animación ────────────────────────────────
    const anims = {
        idle: [
            wrap(shadow + legsIdle + torso(0)  + armL(10)  + armR(-10) + headBase(0)),
            wrap(shadow + legsIdle + torso(-1) + armL(5)   + armR(-5)  + headBase(-1)),
            wrap(shadow + legsIdle + torso(-2) + armL(0)   + armR(0)   + headBase(-2)),
            wrap(shadow + legsIdle + torso(-1) + armL(-5)  + armR(5)   + headBase(-1)),
        ],
        run: [
            wrap(shadow +
                `<path d="M30 108 Q20 120 18 138 Q22 143 26 139 Q30 122 34 108 Z" fill="${outfitColor}"/><ellipse cx="21" cy="140" rx="6" ry="3.5" fill="#0f0f1a"/>
                 <path d="M50 108 Q54 120 55 138 Q52 143 48 139 Q46 122 44 108 Z" fill="${outfitColor}"/><ellipse cx="53" cy="140" rx="6" ry="3.5" fill="#0f0f1a"/>` +
                torso(0) + armL(-35) + armR(35) + headBase(0)),
            wrap(shadow +
                `<path d="M30 108 Q26 122 26 140 Q29 144 33 140 Q34 124 36 108 Z" fill="${outfitColor}"/><ellipse cx="28" cy="142" rx="6" ry="3.5" fill="#0f0f1a"/>
                 <path d="M50 108 Q62 118 65 135 Q61 141 57 137 Q52 120 46 108 Z" fill="${outfitColor}"/><ellipse cx="62" cy="137" rx="6" ry="3.5" fill="#0f0f1a"/>` +
                torso(-2) + armL(35) + armR(-35) + headBase(-2)),
            wrap(shadow +
                `<path d="M30 108 Q26 122 26 140 Q29 144 33 140 Q34 124 36 108 Z" fill="${outfitColor}"/><ellipse cx="28" cy="142" rx="6" ry="3.5" fill="#0f0f1a"/>
                 <path d="M50 108 Q54 120 55 138 Q52 143 48 139 Q46 122 44 108 Z" fill="${outfitColor}"/><ellipse cx="53" cy="140" rx="6" ry="3.5" fill="#0f0f1a"/>` +
                torso(0) + armL(-35) + armR(35) + headBase(0)),
            wrap(shadow +
                `<path d="M30 108 Q18 118 15 135 Q19 141 23 137 Q28 120 32 108 Z" fill="${outfitColor}"/><ellipse cx="18" cy="137" rx="6" ry="3.5" fill="#0f0f1a"/>
                 <path d="M50 108 Q54 122 54 140 Q51 144 47 140 Q46 124 44 108 Z" fill="${outfitColor}"/><ellipse cx="52" cy="142" rx="6" ry="3.5" fill="#0f0f1a"/>` +
                torso(-2) + armL(35) + armR(-35) + headBase(-2)),
        ],
        attack: [
            wrap(shadow + legsIdle + torso(0) + armL(10)  + armR(-10) + headBase(0)),
            wrap(shadow + legsIdle + torso(0) + armL(20)  +
                `<path d="M58 69 L86 62 L88 68 L62 78 Z" fill="${outfitColor}"/><ellipse cx="89" cy="65" rx="7" ry="6" fill="${skinColor}"/>` +
                headBase(0)),
            wrap(shadow + legsIdle + torso(0) + armL(10)  +
                `<path d="M58 69 L90 58 L92 65 L62 74 Z" fill="${outfitColor}"/><ellipse cx="92" cy="61" rx="7" ry="6" fill="${skinColor}"/>
                 <circle cx="96" cy="58" r="8" fill="#f59e0b" opacity="0.2"/>` +
                headBase(0)),
            wrap(shadow + legsIdle + torso(0) + armL(5)   + armR(10)  + headBase(0)),
        ],
        hurt: [
            wrap(shadow +
                `<path d="M28 108 Q24 122 23 140 Q26 144 30 140 Q32 124 34 108 Z" fill="${outfitColor}"/><ellipse cx="25" cy="142" rx="6" ry="3.5" fill="#0f0f1a"/>
                 <path d="M52 108 Q56 122 57 140 Q54 144 50 140 Q48 124 46 108 Z" fill="${outfitColor}"/><ellipse cx="55" cy="142" rx="6" ry="3.5" fill="#0f0f1a"/>` +
                torso(0) +
                `<path d="M22 69 Q18 78 20 94 L26 90 L26 72 Z" fill="${outfitColor}"/><ellipse cx="19" cy="96" rx="6" ry="6" fill="${skinColor}"/>
                 <path d="M58 69 Q62 78 60 94 L54 90 L54 72 Z" fill="${outfitColor}"/><ellipse cx="61" cy="96" rx="6" ry="6" fill="${skinColor}"/>` +
                headBase(0, 'hurt')),
            wrap(shadow +
                `<path d="M28 108 Q24 122 23 140 Q26 144 30 140 Q32 124 34 108 Z" fill="${outfitColor}"/><ellipse cx="25" cy="142" rx="6" ry="3.5" fill="#0f0f1a"/>
                 <path d="M52 108 Q56 122 57 140 Q54 144 50 140 Q48 124 46 108 Z" fill="${outfitColor}"/><ellipse cx="55" cy="142" rx="6" ry="3.5" fill="#0f0f1a"/>` +
                torso(2) +
                `<path d="M22 71 Q14 80 16 96 L22 92 L26 74 Z" fill="${outfitColor}"/><ellipse cx="15" cy="98" rx="6" ry="6" fill="${skinColor}"/>
                 <path d="M58 71 Q66 80 64 96 L58 92 L54 74 Z" fill="${outfitColor}"/><ellipse cx="65" cy="98" rx="6" ry="6" fill="${skinColor}"/>` +
                headBase(2, 'hurt')),
        ],
        jump: [
            wrap(shadow +
                `<path d="M30 108 Q28 118 30 130 Q33 134 37 130 Q36 118 36 108 Z" fill="${outfitColor}"/><ellipse cx="31" cy="132" rx="6" ry="3.5" fill="#0f0f1a"/>
                 <path d="M50 108 Q52 118 50 130 Q47 134 43 130 Q44 118 44 108 Z" fill="${outfitColor}"/><ellipse cx="49" cy="132" rx="6" ry="3.5" fill="#0f0f1a"/>` +
                torso(-4) + armL(-40) + armR(40) + headBase(-4)),
            wrap(shadow +
                `<path d="M32 108 Q24 116 22 128 Q26 134 30 130 Q34 118 36 108 Z" fill="${outfitColor}"/><ellipse cx="25" cy="131" rx="6" ry="3.5" fill="#0f0f1a"/>
                 <path d="M48 108 Q56 116 58 128 Q54 134 50 130 Q46 118 44 108 Z" fill="${outfitColor}"/><ellipse cx="55" cy="131" rx="6" ry="3.5" fill="#0f0f1a"/>` +
                torso(-8) + armL(-60) + armR(60) + headBase(-8)),
            wrap(shadow +
                `<path d="M30 108 Q22 112 20 124 Q24 130 28 126 Q32 114 34 108 Z" fill="${outfitColor}"/><ellipse cx="23" cy="127" rx="6" ry="3.5" fill="#0f0f1a"/>
                 <path d="M50 108 Q58 112 60 124 Q56 130 52 126 Q48 114 46 108 Z" fill="${outfitColor}"/><ellipse cx="57" cy="127" rx="6" ry="3.5" fill="#0f0f1a"/>` +
                torso(-4) + armL(-30) + armR(30) + headBase(-4)),
        ],
    };

    return anims[anim] || anims.idle;
}
