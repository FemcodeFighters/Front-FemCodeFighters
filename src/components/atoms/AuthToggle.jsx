import styles from "../organisms/Auth/AuthUI.module.css";


export default function AuthToggle({ mode, onToggle }) {
    return (
        <div className={styles.toggle}>
            {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            <button className={styles.toggleBtn} onClick={onToggle}>
                {mode === "login" ? "REGÍSTRATE" : "INICIA SESIÓN"}
            </button>
        </div>
    );
}
