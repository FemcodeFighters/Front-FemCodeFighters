import { useState, useEffect } from "react";
import styles from "./CharacterEditor.module.css";
import CharacterPreview from "../../molecules/CharacterPreview";
import ColorSwatch from "../../atoms/ColorSwatch";
import OptionButton from "../../atoms/OptionButton";
import useCharacterStore from "../../../store/useCharacterStore";
import SaveToast from "../../atoms/SaveToast/SaveToast";

const ULTIMATE_INFO = {
    FRIDAY_DEPLOY: {
        name: "FRIDAY DEPLOY",
        description:
            "Despliegue arriesgado en viernes. Te vuelve invulnerable temporalmente y regeneras 30 HP de código base.",
        stats: "HEAL: +30 | INVULNERABLE: 0.5s",
        color: "#00ffc8",
    },
    SPAGHETTI_CODE: {
        name: "SPAGHETTI CODE",
        description:
            "Lanzas una maraña de código sin documentar que enreda a los enemigos, causando daño por cada tick.",
        stats: "DAMAGE: 5/tick | DURATION: 5s",
        color: "#f59e0b",
    },
    GIT_CLONE: {
        name: "GIT CLONE",
        description:
            "Creas una instancia duplicada que embiste a toda velocidad infligiendo 30 de daño masivo.",
        stats: "DAMAGE: 30 | CLONE_LIFE: 6s",
        color: "#3b82f6",
    },
};

const SKIN_COLORS = ["#f5c5a3", "#e8a882", "#c68642", "#8d5524", "#4a2912"];
const HAIR_COLORS = [
    "#7c3aed",
    "#00ffc8",
    "#f59e0b",
    "#ef4444",
    "#1f2937",
    "#ffffff",
    "#ec4899",
];
const EYE_COLORS = [
    "#2563eb",
    "#00ffc8",
    "#ef4444",
    "#f59e0b",
    "#8b5cf6",
    "#1f2937",
    "#10b981",
];
const OUTFIT_COLORS = [
    "#1e1b4b",
    "#1f2937",
    "#7c3aed",
    "#ef4444",
    "#00ffc8",
    "#065f46",
    "#92400e",
];

const HAIR_STYLES = [
    { value: "ponytail", label: "COLETA" },
    { value: "twintails", label: "TWIN TAIL" },
    { value: "pixie", label: "PIXIE" },
    { value: "long", label: "LARGO" },
    { value: "bun", label: "MOÑO" },
    { value: "braids", label: "TRENZAS" },
];
const OUTFITS = [
    { value: "hoodie", label: "HOODIE" },
    { value: "jacket", label: "JACKET" },
    { value: "armor", label: "ARMOR" },
];
const ACCESSORIES = [
    { value: "none", label: "NINGUNO" },
    { value: "glasses", label: "GAFAS" },
    { value: "hat", label: "SOMBRERO" },
    { value: "mask", label: "MÁSCARA" },
    { value: "headphones", label: "AURICULARES" },
];

const TABS = ["PIEL", "PELO", "OJOS", "OUTFIT", "ACCESORIO", "HABILIDAD"];

export default function CharacterEditor({
    onBack,
    onContinue,
    onLogout,
    onEditAccount,
}) {
    const [activeTab, setActiveTab] = useState("PIEL");
    const [showToast, setShowToast] = useState(false);

    const {
        character,
        isLoading,
        isSaving,
        error,
        fetchCharacter,
        setField,
        saveAll,
        reset,
        clearError,
    } = useCharacterStore();

    useEffect(() => {
        fetchCharacter();
    }, [fetchCharacter]);

    useEffect(() => {
        clearError();
    }, [activeTab, clearError]);

    const handleSave = async () => {
        try {
            await saveAll();
            await fetchCharacter();
            setShowToast(true);
        } catch (err) {
            console.error("Error crítico al guardar:", err);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.root}>
                <div className={styles.grid} />
                <div className={styles.loadingText}>
                    // ESTABLECIENDO CONEXIÓN NEURAL...
                </div>
            </div>
        );
    }

    if (!character && !isLoading) {
        return (
            <div className={styles.root}>
                <div className={styles.grid} />
                <div
                    className={styles.loadingText}
                    style={{ color: "#ef4444" }}
                >
                    // ERROR: PERFIL NEURAL NO ENCONTRADO
                    <button
                        onClick={onLogout}
                        className={styles.logoutBtn}
                        style={{ position: "relative", marginTop: "20px" }}
                    >
                        RELOGUEAR
                    </button>
                </div>
            </div>
        );
    }

    const skillKey = character?.ultimateSkill;

    const currentSkill = ULTIMATE_INFO[skillKey] || ULTIMATE_INFO.FRIDAY_DEPLOY;

    console.log("Renderizando con habilidad:", currentSkill.name);
    return (
        <div className={styles.root}>
            <div className={styles.grid} />
            <div className={styles.scanlines} />

            <button className={styles.backBtn} onClick={onBack}>
                ← BACK
            </button>

            <div className={styles.topRight}>
                <button className={styles.accountBtn} onClick={onEditAccount}>
                    ⚙ MI CUENTA
                </button>
                <button className={styles.logoutBtn} onClick={onLogout}>
                    LOGOUT →
                </button>
            </div>

            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    CHARACTER <span>EDITOR</span>
                </div>
                <div className={styles.headerSub}>
                    // CUSTOMIZE YOUR FIGHTER
                </div>
            </div>

            <div className={styles.content}>
                <div className={styles.preview}>
                    <div className={styles.previewLabel}>
                        SINCRONIZACIÓN DE AVATAR
                    </div>
                    <CharacterPreview character={character} size={180} />
                </div>

                <div className={styles.panel}>
                    <div className={styles.tabs}>
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className={styles.scrollArea}>
                        {activeTab === "PIEL" && (
                            <>
                                <div className={styles.sectionTitle}>
                                    // TONO DE DERMIS
                                </div>
                                <div className={styles.swatches}>
                                    {SKIN_COLORS.map((c) => (
                                        <ColorSwatch
                                            key={c}
                                            color={c}
                                            active={character.skinColor === c}
                                            onClick={(v) =>
                                                setField("skinColor", v)
                                            }
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === "PELO" && (
                            <>
                                <div className={styles.sectionTitle}>
                                    // ESTILO CAPILAR
                                </div>
                                <div className={styles.optionRow}>
                                    {HAIR_STYLES.map(({ value, label }) => (
                                        <OptionButton
                                            key={value}
                                            label={label}
                                            active={
                                                character.hairStyle === value
                                            }
                                            onClick={() =>
                                                setField("hairStyle", value)
                                            }
                                        />
                                    ))}
                                </div>
                                <div className={styles.sectionTitle}>
                                    // PIGMENTACIÓN
                                </div>
                                <div className={styles.swatches}>
                                    {HAIR_COLORS.map((c) => (
                                        <ColorSwatch
                                            key={c}
                                            color={c}
                                            active={character.hairColor === c}
                                            onClick={(v) =>
                                                setField("hairColor", v)
                                            }
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === "OJOS" && (
                            <>
                                <div className={styles.sectionTitle}>
                                    // SCANNER OCULAR
                                </div>
                                <div className={styles.swatches}>
                                    {EYE_COLORS.map((c) => (
                                        <ColorSwatch
                                            key={c}
                                            color={c}
                                            active={character.eyeColor === c}
                                            onClick={(v) =>
                                                setField("eyeColor", v)
                                            }
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === "OUTFIT" && (
                            <>
                                <div className={styles.sectionTitle}>
                                    // EQUIPAMIENTO
                                </div>
                                <div className={styles.optionRow}>
                                    {OUTFITS.map(({ value, label }) => (
                                        <OptionButton
                                            key={value}
                                            label={label}
                                            active={character.outfit === value}
                                            onClick={() =>
                                                setField("outfit", value)
                                            }
                                        />
                                    ))}
                                </div>
                                <div className={styles.sectionTitle}>
                                    // COLOR DE UNIDAD
                                </div>
                                <div className={styles.swatches}>
                                    {OUTFIT_COLORS.map((c) => (
                                        <ColorSwatch
                                            key={c}
                                            color={c}
                                            active={character.outfitColor === c}
                                            onClick={(v) =>
                                                setField("outfitColor", v)
                                            }
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === "ACCESORIO" && (
                            <>
                                <div className={styles.sectionTitle}>
                                    // MÓDULOS EXTRA
                                </div>
                                <div className={styles.optionRow}>
                                    {ACCESSORIES.map(({ value, label }) => (
                                        <OptionButton
                                            key={value}
                                            label={label}
                                            active={
                                                character.accessory === value
                                            }
                                            onClick={() =>
                                                setField("accessory", value)
                                            }
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === "HABILIDAD" && (
                            <>
                                <div className={styles.sectionTitle}>
                                    // NÚCLEO DE ULTIMATE
                                </div>
                                <div className={styles.optionRow}>
                                    {Object.keys(ULTIMATE_INFO).map((key) => (
                                        <OptionButton
                                            key={key}
                                            label={ULTIMATE_INFO[key].name}
                                            active={
                                                character.ultimateSkill === key
                                            }
                                            onClick={() =>
                                                setField("ultimateSkill", key)
                                            }
                                        />
                                    ))}
                                </div>

                                <div
                                    className={styles.skillDescriptionBox}
                                    style={{
                                        borderLeftColor: currentSkill.color,
                                    }}
                                >
                                    <div
                                        className={styles.skillDescTitle}
                                        style={{ color: currentSkill.color }}
                                    >
                                        {currentSkill.name}
                                    </div>
                                    <p className={styles.skillDescText}>
                                        {currentSkill.description}
                                    </p>
                                    <div className={styles.skillDescStats}>
                                        <code>
                                            SYSTEM_OUTPUT: {currentSkill.stats}
                                        </code>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {error && <div className={styles.error}>⚠ {error}</div>}

                    <div className={styles.actions}>
                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <span>
                                {isSaving ? "GUARDANDO..." : "> SUBIR DATOS"}
                            </span>
                        </button>
                        <button
                            className={styles.resetBtn}
                            onClick={reset}
                            disabled={isSaving}
                        >
                            RESET
                        </button>
                    </div>

                    <button className={styles.continueBtn} onClick={onContinue}>
                        CONTINUAR AL COMBATE →
                    </button>
                </div>
            </div>
            <SaveToast visible={showToast} onHide={() => setShowToast(false)} />
        </div>
    );
}
