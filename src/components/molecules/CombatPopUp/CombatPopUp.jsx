import { useState, useEffect } from "react";
import { EventBus } from "../../../game/EventBus";
import styles from "./CombatPopUp.module.css";

export default function CombatPopUp() {
    const [attackName, setAttackName] = useState("");
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const showAttack = (name) => {
            setAttackName(name);
            setVisible(true);

            const timer = setTimeout(() => {
                setVisible(false);
            }, 1500);

            return () => clearTimeout(timer);
        };

        EventBus.on("player-attack-fired", showAttack);

        return () => {
            EventBus.off("player-attack-fired", showAttack);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className={styles.container}>
            <div className={styles.glitchText} data-text={attackName}>
                {attackName}
            </div>
        </div>
    );
}
