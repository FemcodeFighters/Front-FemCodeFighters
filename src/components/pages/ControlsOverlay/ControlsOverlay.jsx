import styles from "./ControlsOverlay.module.css";
import BackButton from "../../atoms/BackButton/BackButton";

export default function ControlsOverlay({ onDismiss, onBack }) {
    return (
        <div className={styles.root}>
            <div className={styles.grid}></div>
            <div className={styles.scanlines}></div>
            <div className={styles.glitchLine}></div>

            <BackButton onBack={onBack}/>

            <div className={styles.content}>
                <span className={styles.supertitle}>
                    SISTEMA DE COMBATE V1.0
                </span>

                <div className={styles.titleRow}>
                    <span className={styles.titleWhite}>GUÍA DE</span>
                    <span className={styles.titleCyan}>CONTROLES</span>
                </div>

                <div className={styles.divider}></div>

                <div className={styles.controlsGrid}>
                    <div className={styles.sectionTitle}>NAVEGACIÓN</div>
                    <div className={styles.instructionRow}>
                        <span className={styles.actionText}>MOVERSE</span>
                        <div className={styles.keyContainer}>
                            <kbd className={styles.keyLabel}>LEFT</kbd>
                            <kbd className={styles.keyLabel}>RIGHT</kbd>
                        </div>
                    </div>
                    <div className={styles.instructionRow}>
                        <span className={styles.actionText}>
                            SALTO ACROBÁTICO
                        </span>
                        <kbd className={styles.keyLabel}>SPACE</kbd>
                    </div>

                    <div className={styles.sectionTitle}>
                        PROTOCOLOS DE ATAQUE
                    </div>
                    <div className={styles.instructionRow}>
                        <span className={styles.actionText}>
                            STACKOVERFLOW SMASH
                        </span>
                        <kbd className={styles.keyLabel}>F</kbd>
                    </div>
                    <div className={styles.instructionRow}>
                        <span className={styles.actionText}>
                            RUBBER DUCK DEBUGGING
                        </span>
                        <kbd className={styles.keyLabel}>G</kbd>
                    </div>
                    <div className={styles.instructionRow}>
                        <span
                            className={`${styles.actionText} ${styles.ultimateText}`}
                        >
                            ULTIMATE
                        </span>
                        <kbd
                            className={`${styles.keyLabel} ${styles.ultimateKey}`}
                        >
                            R
                        </kbd>
                    </div>
                </div>

                <div className={styles.buttons}>
                    <button className={styles.playBtn} onClick={onDismiss}>
                        <span>INICIALIZAR COMBATE</span>
                    </button>
                </div>
            </div>

            <div className={styles.version}>SYSTEM_STATUS: READY</div>
        </div>
    );
}
