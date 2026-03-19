import { useEffect, useState } from "react";
import styles from "./SaveToast.module.css";

export default function SaveToast({ visible, onHide }) {
    const [phase, setPhase] = useState("hidden");

    useEffect(() => {
        if (!visible) return;

        setPhase("enter");

        const hideTimer = setTimeout(() => setPhase("exit"), 2800);
        const doneTimer = setTimeout(() => {
            setPhase("hidden");
            onHide?.();
        }, 3400);

        return () => {
            clearTimeout(hideTimer);
            clearTimeout(doneTimer);
        };
    }, [visible]);

    if (phase === "hidden") return null;

    return (
        <div className={`${styles.toast} ${styles[phase]}`}>
            <div className={styles.bar} />
            <div className={styles.content}>
                <span className={styles.icon}>✓</span>
                <div className={styles.texts}>
                    <span className={styles.title}>DATOS GUARDADOS</span>
                    <span className={styles.sub}>// NEURAL SYNC COMPLETE</span>
                </div>
            </div>
            <div className={styles.progress} />
        </div>
    );
}
