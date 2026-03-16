import styles from './GameModeSelect.module.css';

export default function GameModeSelect({ onSelectSolo, onBack }) {
    return (
        <div className={styles.root}>
            <div className={styles.grid} />
            <div className={styles.scanlines} />

            <button className={styles.backBtn} onClick={onBack}>
                ← BACK
            </button>

            <div className={styles.content}>
                <div className={styles.supertitle}>// SELECT MODE</div>
                <div className={styles.title}>
                    CHOOSE YOUR <span>BATTLE</span>
                </div>

                <div className={styles.cards}>
                    {/* ── Solo ── */}
                    <div className={styles.card} onClick={onSelectSolo}>
                        <div className={styles.cardIcon}>⚔️</div>
                        <div className={styles.cardTitle}>SOLO</div>
                        <div className={styles.cardDesc}>
                            1 jugadora vs IA<br />
                            Enfréntate a los lenguajes<br />
                            de programación en solitario
                        </div>
                        <div className={styles.tagReady}>DISPONIBLE</div>
                    </div>

                    {/* ── Co-op online (próximamente) ── */}
                    <div className={styles.cardDisabled}>
                        <div className={styles.cardIcon}>🌐</div>
                        <div className={styles.cardTitle}>CO-OP ONLINE</div>
                        <div className={styles.cardDesc}>
                            2-4 jugadoras vs IA<br />
                            Únete con otras devs<br />
                            para derrotar el stack
                        </div>
                        <div className={styles.tagSoon}>PRÓXIMAMENTE</div>
                    </div>
                </div>

                <div className={styles.divider} />
            </div>
        </div>
    );
}
