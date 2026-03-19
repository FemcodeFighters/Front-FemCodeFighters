export function generateEnemySVG(type) {
    const designs = {
        HTML: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
            <ellipse cx="64" cy="122" rx="28" ry="5" fill="#000" opacity="0.3"/>
            <rect x="44" y="96" width="14" height="22" rx="4" fill="#c43e1c"/>
            <rect x="70" y="96" width="14" height="22" rx="4" fill="#c43e1c"/>
            <ellipse cx="51" cy="119" rx="9" ry="4" fill="#8b2a0e"/>
            <ellipse cx="77" cy="119" rx="9" ry="4" fill="#8b2a0e"/>
            <path d="M28 30 L36 105 L64 114 L92 105 L100 30 Z" fill="#E44D26"/>
            <path d="M64 106 L86 100 L93 30 L64 30 Z" fill="#F16529"/>
            <rect x="36" y="45" width="52" height="10" rx="2" fill="#fff" opacity="0.25"/>
            <rect x="38" y="62" width="48" height="10" rx="2" fill="#fff" opacity="0.25"/>
            <text x="42" y="56" font-family="monospace" font-size="16" font-weight="bold" fill="#fff" opacity="0.9">&lt;</text>
            <text x="68" y="56" font-family="monospace" font-size="16" font-weight="bold" fill="#fff" opacity="0.9">&gt;</text>
            <rect x="46" y="70" width="36" height="8" rx="3" fill="#8b2a0e"/>
            <text x="50" y="78" font-family="monospace" font-size="8" fill="#ff9980">/html</text>
            <path d="M28 50 L16 60 L28 70" stroke="#E44D26" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M100 50 L112 60 L100 70" stroke="#E44D26" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="14" cy="60" r="7" fill="#c43e1c"/>
            <circle cx="114" cy="60" r="7" fill="#c43e1c"/>
            <text x="55" y="48" font-family="Orbitron,monospace" font-size="14" font-weight="bold" fill="#fff" opacity="0.6">5</text>
        </svg>`,

        CSS: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
            <ellipse cx="64" cy="122" rx="28" ry="5" fill="#000" opacity="0.3"/>
            <path d="M48 96 Q44 110 46 120" stroke="#1a35b8" stroke-width="12" fill="none" stroke-linecap="round"/>
            <path d="M80 96 Q84 110 82 120" stroke="#1a35b8" stroke-width="12" fill="none" stroke-linecap="round"/>
            <ellipse cx="46" cy="120" rx="8" ry="4" fill="#122a99"/>
            <ellipse cx="82" cy="120" rx="8" ry="4" fill="#122a99"/>
            <path d="M28 30 L36 105 L64 114 L92 105 L100 30 Z" fill="#264DE4"/>
            <path d="M64 106 L86 100 L93 30 L64 30 Z" fill="#2965F1"/>
            <ellipse cx="64" cy="68" rx="30" ry="36" fill="none" stroke="#61a8ff" stroke-width="1.5" opacity="0.4" stroke-dasharray="4 3"/>
            <path d="M28 52 Q20 55 22 60 Q20 65 28 68" stroke="#4169e1" stroke-width="5" fill="none" stroke-linecap="round"/>
            <path d="M100 52 Q108 55 106 60 Q108 65 100 68" stroke="#4169e1" stroke-width="5" fill="none" stroke-linecap="round"/>
            <circle cx="19" cy="60" r="6" fill="#2965F1"/>
            <circle cx="109" cy="60" r="6" fill="#2965F1"/>
            <circle cx="50" cy="56" r="8" fill="#fff"/>
            <circle cx="78" cy="56" r="8" fill="#fff"/>
            <circle cx="50" cy="56" r="5" fill="#264DE4"/>
            <circle cx="78" cy="56" r="5" fill="#264DE4"/>
            <circle cx="48" cy="54" r="2" fill="#fff" opacity="0.8"/>
            <circle cx="76" cy="54" r="2" fill="#fff" opacity="0.8"/>
            <rect x="42" y="70" width="44" height="9" rx="3" fill="#122a99"/>
            <text x="46" y="78" font-family="monospace" font-size="8" fill="#7eb3ff">z:9999</text>
            <text x="56" y="48" font-family="Orbitron,monospace" font-size="13" font-weight="bold" fill="#fff" opacity="0.5">3</text>
        </svg>`,

        JAVASCRIPT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
            <ellipse cx="64" cy="122" rx="28" ry="5" fill="#000" opacity="0.3"/>
            <ellipse cx="64" cy="108" rx="32" ry="8" fill="#f7a800" opacity="0.4"/>
            <rect x="44" y="92" width="13" height="24" rx="4" fill="#c8b400"/>
            <rect x="71" y="92" width="13" height="24" rx="4" fill="#c8b400"/>
            <ellipse cx="50" cy="117" rx="9" ry="4" fill="#8a7a00"/>
            <ellipse cx="77" cy="117" rx="9" ry="4" fill="#8a7a00"/>
            <rect x="24" y="28" width="80" height="80" rx="8" fill="#F7DF1E"/>
            <rect x="24" y="28" width="80" height="80" rx="8" fill="none" stroke="#c8b400" stroke-width="2"/>
            <rect x="50" y="28" width="54" height="80" rx="0 8 8 0" fill="#e8ce00" opacity="0.4"/>
            <line x1="24" y1="50" x2="8" y2="44" stroke="#c8b400" stroke-width="5" stroke-linecap="round"/>
            <line x1="24" y1="65" x2="6" y2="65" stroke="#c8b400" stroke-width="5" stroke-linecap="round"/>
            <line x1="24" y1="80" x2="8" y2="86" stroke="#c8b400" stroke-width="5" stroke-linecap="round"/>
            <circle cx="7" cy="44" r="5" fill="#F7DF1E"/>
            <circle cx="5" cy="65" r="5" fill="#F7DF1E"/>
            <circle cx="7" cy="86" r="5" fill="#F7DF1E"/>
            <line x1="104" y1="50" x2="120" y2="44" stroke="#c8b400" stroke-width="5" stroke-linecap="round"/>
            <line x1="104" y1="65" x2="122" y2="65" stroke="#c8b400" stroke-width="5" stroke-linecap="round"/>
            <line x1="104" y1="80" x2="120" y2="86" stroke="#c8b400" stroke-width="5" stroke-linecap="round"/>
            <circle cx="121" cy="44" r="5" fill="#F7DF1E"/>
            <circle cx="123" cy="65" r="5" fill="#F7DF1E"/>
            <circle cx="121" cy="86" r="5" fill="#F7DF1E"/>
            <rect x="36" y="48" width="18" height="14" rx="3" fill="#1a0a00"/>
            <rect x="74" y="48" width="18" height="14" rx="3" fill="#1a0a00"/>
            <text x="38" y="59" font-family="monospace" font-size="9" fill="#ff3300">ERR</text>
            <text x="76" y="59" font-family="monospace" font-size="9" fill="#ff3300">ERR</text>
            <rect x="34" y="68" width="60" height="12" rx="3" fill="#1a0a00"/>
            <text x="38" y="77" font-family="monospace" font-size="8" fill="#f7df1e">undefined</text>
            <text x="38" y="42" font-family="Orbitron,monospace" font-size="11" font-weight="bold" fill="#323330" opacity="0.5">JS</text>
        </svg>`,

        REACT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
            <ellipse cx="64" cy="122" rx="28" ry="5" fill="#000" opacity="0.3"/>
            <line x1="52" y1="100" x2="46" y2="120" stroke="#40b8d0" stroke-width="8" stroke-linecap="round"/>
            <line x1="76" y1="100" x2="82" y2="120" stroke="#40b8d0" stroke-width="8" stroke-linecap="round"/>
            <ellipse cx="46" cy="121" rx="8" ry="4" fill="#2a8fa6"/>
            <ellipse cx="82" cy="121" rx="8" ry="4" fill="#2a8fa6"/>
            <ellipse cx="64" cy="64" rx="56" ry="18" fill="none" stroke="#61DAFB" stroke-width="2" opacity="0.5" stroke-dasharray="5 3"/>
            <ellipse cx="64" cy="64" rx="56" ry="18" fill="none" stroke="#61DAFB" stroke-width="2" opacity="0.5" stroke-dasharray="5 3" transform="rotate(60 64 64)"/>
            <ellipse cx="64" cy="64" rx="56" ry="18" fill="none" stroke="#61DAFB" stroke-width="2" opacity="0.5" stroke-dasharray="5 3" transform="rotate(120 64 64)"/>
            <circle cx="120" cy="64" r="5" fill="#61DAFB"/>
            <circle cx="34" cy="33" r="5" fill="#61DAFB"/>
            <circle cx="34" cy="95" r="5" fill="#61DAFB"/>
            <circle cx="64" cy="64" r="32" fill="#20232a"/>
            <circle cx="64" cy="64" r="28" fill="#282c34"/>
            <circle cx="64" cy="64" r="24" fill="#61DAFB" opacity="0.15"/>
            <rect x="44" y="54" width="14" height="14" rx="7" fill="#61DAFB"/>
            <rect x="70" y="54" width="14" height="14" rx="7" fill="#61DAFB"/>
            <circle cx="51" cy="61" r="5" fill="#20232a"/>
            <circle cx="77" cy="61" r="5" fill="#20232a"/>
            <circle cx="49" cy="59" r="2" fill="#fff" opacity="0.7"/>
            <circle cx="75" cy="59" r="2" fill="#fff" opacity="0.7"/>
            <path d="M48 74 Q64 82 80 74" stroke="#61DAFB" stroke-width="3" fill="none" stroke-linecap="round"/>
            <circle cx="64" cy="64" r="5" fill="#61DAFB"/>
        </svg>`,

        JAVA: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
            <ellipse cx="64" cy="122" rx="30" ry="5" fill="#000" opacity="0.4"/>
            <rect x="42" y="100" width="14" height="20" rx="5" fill="#4a6fa8"/>
            <rect x="72" y="100" width="14" height="20" rx="5" fill="#4a6fa8"/>
            <ellipse cx="49" cy="120" rx="10" ry="5" fill="#2a4f88"/>
            <ellipse cx="79" cy="120" rx="10" ry="5" fill="#2a4f88"/>
            <ellipse cx="64" cy="104" rx="42" ry="7" fill="#b0b8d0"/>
            <ellipse cx="64" cy="102" rx="38" ry="6" fill="#d0d8f0"/>
            <path d="M24 60 Q24 104 64 104 Q104 104 104 60 Z" fill="#e8ecf8"/>
            <path d="M24 60 Q24 44 64 44 Q104 44 104 60 Z" fill="#ffffff"/>
            <rect x="24" y="70" width="80" height="6" fill="#2a5ba8" opacity="0.2"/>
            <ellipse cx="64" cy="60" rx="40" ry="16" fill="#fff" opacity="0.5"/>
            <ellipse cx="64" cy="58" rx="30" ry="11" fill="#2a1800"/>
            <ellipse cx="64" cy="57" rx="26" ry="9" fill="#180e00"/>
            <ellipse cx="56" cy="54" rx="7" ry="3" fill="#3a2200" opacity="0.5"/>
            <path d="M104 65 Q124 65 124 78 Q124 91 104 91" stroke="#b0b8d0" stroke-width="10" fill="none" stroke-linecap="round"/>
            <path d="M104 65 Q122 65 122 78 Q122 91 104 91" stroke="#e8ecf8" stroke-width="6" fill="none" stroke-linecap="round"/>
            <path d="M24 68 Q10 65 8 75 Q6 85 18 86" stroke="#4a6fa8" stroke-width="8" fill="none" stroke-linecap="round"/>
            <circle cx="17" cy="87" r="7" fill="#2a5ba8"/>
            <line x1="12" y1="83" x2="8" y2="78" stroke="#4a6fa8" stroke-width="3" stroke-linecap="round"/>
            <line x1="17" y1="81" x2="15" y2="76" stroke="#4a6fa8" stroke-width="3" stroke-linecap="round"/>
            <line x1="22" y1="83" x2="22" y2="77" stroke="#4a6fa8" stroke-width="3" stroke-linecap="round"/>
            <path d="M44 44 Q40 30 46 20 Q50 12 44 4" stroke="#cc0000" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
            <path d="M64 44 Q60 28 66 16 Q70 8 64 0" stroke="#ff2200" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.9"/>
            <path d="M84 44 Q88 30 82 20 Q78 12 84 4" stroke="#cc0000" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.8"/>
            <circle cx="50" cy="68" r="8" fill="#fff"/>
            <circle cx="78" cy="68" r="8" fill="#fff"/>
            <circle cx="50" cy="68" r="5" fill="#1a0800"/>
            <circle cx="78" cy="68" r="5" fill="#1a0800"/>
            <circle cx="48" cy="66" r="2" fill="#fff" opacity="0.9"/>
            <circle cx="76" cy="66" r="2" fill="#fff" opacity="0.9"/>
            <path d="M48 82 Q64 76 80 82" stroke="#4a6fa8" stroke-width="3" fill="none" stroke-linecap="round"/>
            <line x1="44" y1="60" x2="56" y2="63" stroke="#2a5ba8" stroke-width="3" stroke-linecap="round"/>
            <line x1="72" y1="63" x2="84" y2="60" stroke="#2a5ba8" stroke-width="3" stroke-linecap="round"/>
            <text x="46" y="97" font-family="Orbitron,monospace" font-size="10" font-weight="bold" fill="#2a5ba8" opacity="0.7">JAVA</text>
        </svg>`,

        SPRINGBOOT: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
            <ellipse cx="64" cy="122" rx="30" ry="5" fill="#000" opacity="0.4"/>
            <path d="M50 106 Q42 114 38 122" stroke="#2d6e10" stroke-width="10" fill="none" stroke-linecap="round"/>
            <path d="M78 106 Q86 114 90 122" stroke="#2d6e10" stroke-width="10" fill="none" stroke-linecap="round"/>
            <path d="M50 112 Q36 118 30 122" stroke="#1e5008" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7"/>
            <path d="M78 112 Q92 118 98 122" stroke="#1e5008" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7"/>
            <path d="M64 106 Q20 90 18 52 Q18 20 64 16 Q64 16 64 106 Z" fill="#6DB33F"/>
            <path d="M64 106 Q108 90 110 52 Q110 20 64 16 Q64 16 64 106 Z" fill="#5a9e33"/>
            <line x1="64" y1="16" x2="64" y2="106" stroke="#3a7020" stroke-width="3" opacity="0.6"/>
            <path d="M64 35 Q42 40 28 50" stroke="#3a7020" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M64 52 Q38 56 24 64" stroke="#3a7020" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M64 68 Q40 72 28 78" stroke="#3a7020" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M64 84 Q44 87 34 92" stroke="#3a7020" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M64 35 Q86 40 100 50" stroke="#4a8a2a" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M64 52 Q90 56 104 64" stroke="#4a8a2a" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M64 68 Q88 72 100 78" stroke="#4a8a2a" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M64 84 Q84 87 94 92" stroke="#4a8a2a" stroke-width="1.5" fill="none" opacity="0.5"/>
            <path d="M64 62 Q72 54 72 46 Q72 36 62 34 Q50 32 46 42 Q42 52 50 58 Q58 64 66 60 Q74 56 74 48" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.85"/>
            <path d="M22 54 Q10 50 7 60 Q5 68 12 70" stroke="#6DB33F" stroke-width="7" fill="none" stroke-linecap="round"/>
            <path d="M12 70 Q7 80 13 85" stroke="#5a9e33" stroke-width="6" fill="none" stroke-linecap="round"/>
            <ellipse cx="14" cy="87" rx="8" ry="5" fill="#6DB33F" transform="rotate(-30 14 87)"/>
            <path d="M106 54 Q118 50 121 60 Q123 68 116 70" stroke="#6DB33F" stroke-width="7" fill="none" stroke-linecap="round"/>
            <path d="M116 70 Q121 80 115 85" stroke="#5a9e33" stroke-width="6" fill="none" stroke-linecap="round"/>
            <ellipse cx="114" cy="87" rx="8" ry="5" fill="#6DB33F" transform="rotate(30 114 87)"/>
            <circle cx="50" cy="68" r="9" fill="#1a3a08"/>
            <circle cx="78" cy="68" r="9" fill="#1a3a08"/>
            <circle cx="50" cy="68" r="5" fill="#7ec44f"/>
            <circle cx="78" cy="68" r="5" fill="#7ec44f"/>
            <circle cx="48" cy="66" r="2" fill="#fff" opacity="0.7"/>
            <circle cx="76" cy="66" r="2" fill="#fff" opacity="0.7"/>
            <text x="40" y="62" font-family="monospace" font-size="7" fill="#c8f0a0" opacity="0.8">@Bean</text>
            <text x="68" y="62" font-family="monospace" font-size="7" fill="#c8f0a0" opacity="0.8">@Bean</text>
            <path d="M46 82 L52 78 L58 82 L64 78 L70 82 L76 78 L82 82" stroke="#2d6e10" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M58 16 Q64 6 70 16" fill="#7ec44f" opacity="0.6"/>
        </svg>`,
    };

    return designs[type] || designs["JAVASCRIPT"];
}

export async function loadEnemyTextures(scene) {
    const types = ["HTML", "CSS", "JAVASCRIPT", "REACT", "JAVA", "SPRINGBOOT"];

    const promises = types.map((type) => {
        if (scene.textures.exists(type)) return Promise.resolve();

        return new Promise((resolve) => {
            const svg = generateEnemySVG(type);
            const blob = new Blob([svg], {
                type: "image/svg+xml;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            scene.load.image(type, url);
            scene.load.once("filecomplete-image-" + type, () => {
                URL.revokeObjectURL(url);
                resolve();
            });
        });
    });

    scene.load.start();
    await Promise.all(promises);
}
