import styles from "../organisms/CharacterEditor/CharacterEditor.module.css";

export default function OptionButton({ label, active, onClick }) {
    return (
        <button
            className={`${styles.optionBtn} ${active ? styles.optionBtnActive : ""}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
}
