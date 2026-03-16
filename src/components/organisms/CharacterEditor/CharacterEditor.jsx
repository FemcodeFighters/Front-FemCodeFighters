import { useState, useEffect } from "react";
import styles from "./CharacterEditor.module.css";
import CharacterPreview from "../../molecules/CharacterPreview";
import ColorSwatch from "../../atoms/ColorSwatch";
import OptionButton from "../../atoms/OptionButton";
import useCharacterStore from "../../../store/useCharacterStore";

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

const TABS = ["PIEL", "PELO", "OJOS", "OUTFIT", "ACCESORIO"];

export default function CharacterEditor({ onBack, onContinue }) {
    const [activeTab, setActiveTab] = useState("PIEL");

    const {
        character,
        isLoading,
        isSaving,
        error,
        fetchCharacter,
        setField,
        saveSkinColor,
        saveHair,
        saveEyeColor,
        saveOutfit,
        saveAccessory,
        reset,
        clearError,
    } = useCharacterStore();

    useEffect(() => {
        fetchCharacter();
    }, []);

    const handleSave = async () => {
        clearError();
        switch (activeTab) {
            case "PIEL":
                await saveSkinColor();
                break;
            case "PELO":
                await saveHair();
                break;
            case "OJOS":
                await saveEyeColor();
                break;
            case "OUTFIT":
                await saveOutfit();
                break;
            case "ACCESORIO":
                await saveAccessory();
                break;
        }
    };

    if (isLoading) {
        return (
            <div className={styles.root}>
                <div className={styles.grid} />
                <div
                    style={{
                        color: "#00ffc8",
                        fontFamily: "monospace",
                        fontSize: 12,
                        letterSpacing: "0.2em",
                    }}
                >
                    // CARGANDO PERSONAJE...
                </div>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.grid} />
            <div className={styles.scanlines} />

            <button className={styles.backBtn} onClick={onBack}>
                ← BACK
            </button>

            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    CHARACTER <span>EDITOR</span>
                </div>
                <div className={styles.headerSub}>
                    // CUSTOMIZE YOUR FIGHTER
                </div>
            </div>

            <div className={styles.content}>
                {/* Preview */}
                <div className={styles.preview}>
                    <div className={styles.previewLabel}>PREVIEW</div>
                    <CharacterPreview character={character} size={180} />
                </div>

                {/* Panel */}
                <div className={styles.panel}>
                    {/* Tabs */}
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

                    {/* ── PIEL ── */}
                    {activeTab === "PIEL" && (
                        <>
                            <div className={styles.sectionTitle}>
                                // COLOR DE PIEL
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

                    {/* ── PELO ── */}
                    {activeTab === "PELO" && (
                        <>
                            <div className={styles.sectionTitle}>// ESTILO</div>
                            <div className={styles.optionRow}>
                                {HAIR_STYLES.map(({ value, label }) => (
                                    <OptionButton
                                        key={value}
                                        label={label}
                                        active={character.hairStyle === value}
                                        onClick={() =>
                                            setField("hairStyle", value)
                                        }
                                    />
                                ))}
                            </div>
                            <div className={styles.sectionTitle}>// COLOR</div>
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

                    {/* ── OJOS ── */}
                    {activeTab === "OJOS" && (
                        <>
                            <div className={styles.sectionTitle}>
                                // COLOR DE OJOS
                            </div>
                            <div className={styles.swatches}>
                                {EYE_COLORS.map((c) => (
                                    <ColorSwatch
                                        key={c}
                                        color={c}
                                        active={character.eyeColor === c}
                                        onClick={(v) => setField("eyeColor", v)}
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {/* ── OUTFIT ── */}
                    {activeTab === "OUTFIT" && (
                        <>
                            <div className={styles.sectionTitle}>// ESTILO</div>
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
                            <div className={styles.sectionTitle}>// COLOR</div>
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

                    {/* ── ACCESORIO ── */}
                    {activeTab === "ACCESORIO" && (
                        <>
                            <div className={styles.sectionTitle}>
                                // ACCESORIO
                            </div>
                            <div className={styles.optionRow}>
                                {ACCESSORIES.map(({ value, label }) => (
                                    <OptionButton
                                        key={value}
                                        label={label}
                                        active={character.accessory === value}
                                        onClick={() =>
                                            setField("accessory", value)
                                        }
                                    />
                                ))}
                            </div>
                        </>
                    )}

                    {error && <div className={styles.error}>⚠ {error}</div>}

                    <div className={styles.actions}>
                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <span>{isSaving ? "..." : "> GUARDAR"}</span>
                        </button>
                        <button className={styles.resetBtn} onClick={reset}>
                            RESET
                        </button>
                    </div>

                    <button className={styles.continueBtn} onClick={onContinue}>
                        CONTINUAR →
                    </button>
                </div>
            </div>
        </div>
    );
}
