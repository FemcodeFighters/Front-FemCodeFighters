export const DEFAULT_ULTIMATE = "FRIDAY_DEPLOY";

export const ULTIMATE_INFO = {
    FRIDAY_DEPLOY: {
        id: "FRIDAY_DEPLOY",
        name: "FRIDAY DEPLOY",
        icon: "⚠️",
        color: "#00ffc8",
        description:
            "Despliegue arriesgado en viernes: te vuelve invulnerable unos segundos y regeneras 30 HP. En co-op es una apuesta: un 50% de las veces cura 30 HP a todo el equipo y el otro 50% falla y daña 20 HP a todas, incluida quien lo lanza.",
        stats: "HEAL: +30 | INVULNERABLE: 3s | CO-OP: 50% FAIL → -20 TEAM",
    },
    SPAGHETTI_CODE: {
        id: "SPAGHETTI_CODE",
        name: "SPAGHETTI CODE",
        icon: "🍝",
        color: "#f59e0b",
        description:
            "Lanzas una maraña de código sin documentar que enreda a los enemigos y les causa daño en cada tick. En co-op el código también enreda a tus aliadas, aunque con mucho menos daño.",
        stats: "DAMAGE: 5/tick | DURATION: 5s | CO-OP ALLIES: 1/tick",
    },
    GIT_CLONE: {
        id: "GIT_CLONE",
        name: "GIT CLONE",
        icon: "👥",
        color: "#3b82f6",
        description:
            "Creas una instancia duplicada que embiste a toda velocidad infligiendo daño masivo. En co-op el clon puede equivocarse: un 10% de las veces embiste a una aliada al azar en vez de al enemigo.",
        stats: "DAMAGE: 35 | CO-OP FRIENDLY FIRE: 10%",
    },
};