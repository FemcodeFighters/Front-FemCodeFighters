import styles from "./BackButton.module.css";

function BackButton({ onBack }) {
    return (
        <button className={styles.backBtn} onClick={onBack}>
            ← BACK
        </button>
    );
}

export default BackButton;