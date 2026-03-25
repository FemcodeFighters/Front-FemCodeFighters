import styles from "./GameModeSelect.module.css";
import BackButton from "../../atoms/BackButton/BackButton";

export default function GameModeSelect({ onSelectSolo, onSelectCoop, onBack }) {
    return (
        <div className={styles.root}>
            <div className={styles.grid} />
            <div className={styles.scanlines} />

            <BackButton onBack={onBack} />

            <div className={styles.content}>
                <div className={styles.supertitle}>// SELECT MODE</div>
                <div className={styles.title}>
                    CHOOSE YOUR <span>BATTLE</span>
                </div>

                <div className={styles.cards}>
                    <div className={styles.card} onClick={onSelectSolo}>
                        <div className={styles.cardIcon}>⚔️</div>
                        <div className={styles.cardTitle}>SOLO</div>
                        <div className={styles.cardDesc}>
                            <p>1 jugadora vs IA</p>
                            <p>Enfréntate a los lenguajes</p>
                            <p>de programación en solitario</p>
                        </div>
                        <div className={styles.tagReady}>DISPONIBLE</div>
                    </div>

                    <div className={styles.card} onClick={onSelectCoop}>
                        <div className={styles.cardIcon}>🌐</div>
                        <div className={styles.cardTitle}>CO-OP ONLINE</div>
                        <div className={styles.cardDesc}>
                            <p>2-4 jugadoras vs IA</p>
                            <p>Únete con otras devs</p>
                            <p>para derrotar el stack</p>
                        </div>
                        <div className={styles.tagReady}>DISPONIBLE</div>
                    </div>
                </div>

                <div className={styles.divider} />
            </div>
        </div>
    );
}
