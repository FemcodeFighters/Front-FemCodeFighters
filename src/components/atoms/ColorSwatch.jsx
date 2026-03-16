import styles from "../organisms/CharacterEditor/CharacterEditor.module.css";

export default function ColorSwatch({ color, active, onClick }) {
    return (
        <button
            className={`${styles.swatch} ${active ? styles.swatchActive : ""}`}
            style={{ background: color }}
            onClick={() => onClick(color)}
            aria-label={color}
        />
    );
}
