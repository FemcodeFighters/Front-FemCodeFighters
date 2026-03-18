const ENEMY_DESIGNS = {
    HTML: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path d="M10 5 L54 5 L50 55 L32 60 L14 55 Z" fill="#E44D26"/>
        <path d="M32 12 L32 52 L45 48 L48 12 Z" fill="#F16529"/>
        <path d="M20 20 L44 20 L43 25 L21 25 Z M21 30 L42 30 L41 38 L32 41 L23 38 L22 34" fill="white" opacity="0.9"/>
    </svg>`,

    CSS: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path d="M10 5 L54 5 L50 55 L32 60 L14 55 Z" fill="#264DE4"/>
        <path d="M32 12 L32 52 L45 48 L48 12 Z" fill="#2965F1"/>
        <path d="M20 20 L44 20 L43 25 L21 25 Z M21 30 L42 30 L41 38 L32 41 L22 38" fill="white" opacity="0.9"/>
    </svg>`,

    JAVASCRIPT: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <rect x="5" y="5" width="54" height="54" rx="4" fill="#F7DF1E"/>
        <path d="M35 30 L35 45 Q35 52 28 52 M50 30 L50 45 Q50 52 43 52" stroke="#323330" fill="none" stroke-width="6"/>
    </svg>`,

    REACT: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="6" fill="#61DAFB"/>
        <ellipse cx="32" cy="32" rx="28" ry="10" stroke="#61DAFB" fill="none" stroke-width="2"/>
        <ellipse cx="32" cy="32" rx="28" ry="10" stroke="#61DAFB" fill="none" stroke-width="2" transform="rotate(60 32 32)"/>
        <ellipse cx="32" cy="32" rx="28" ry="10" stroke="#61DAFB" fill="none" stroke-width="2" transform="rotate(120 32 32)"/>
    </svg>`,

    JAVA: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <path d="M20 45 Q32 55 44 45 L48 30 Q32 25 16 30 Z" fill="#5382A1"/>
        <path d="M25 25 Q32 10 40 25" stroke="#E76F00" stroke-width="4" fill="none"/>
        <path d="M22 20 Q32 5 43 20" stroke="#E76F00" stroke-width="3" fill="none" opacity="0.7"/>
    </svg>`,

    SPRINGBOOT: `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="#6DB33F"/>
        <path d="M32 15 L45 45 L32 40 L19 45 Z" fill="white"/>
        <circle cx="32" cy="30" r="5" fill="#6DB33F"/>
    </svg>`,
};
