import styles from "../organisms/Auth/AuthUI.module.css";

export default function AuthError({ message }) {
    if (!message) return null;
    return <div className={styles.error}>⚠ {message}</div>;
}
