import { useState } from "react";
import styles from "./AuthUI.module.css";
import AuthForm from "../../molecules/AuthForm";
import useAuthStore from "../../../store/useAuthStore";
import { EventBus } from "../../../game/EventBus"; 

export default function AuthUI({ onBack, onSuccess }) {
    const [mode, setMode] = useState("login");
    const { login, register, isLoading, error, clearError } = useAuthStore();

    const handleSubmit = async ({ username, email, password }) => {
        EventBus.emit('user-interacted'); 
        
        clearError();
        const success = mode === "register"
                ? await register(username, email, password)
                : await login(email, password);

        if (success) onSuccess?.();
    };

    const handleToggle = () => {
        EventBus.emit('user-interacted'); 
        clearError();
        setMode(mode === "login" ? "register" : "login");
    };

    return (
        <div className={styles.root}>
            <div className={styles.grid} />
            <div className={styles.scanlines} />

            <button className={styles.backBtn} onClick={onBack}>
                ← BACK
            </button>

            <div className={styles.card}>
                <div className={styles.title}>
                    CODE<span>FIGHTERS</span>
                </div>
                <div className={styles.subtitle}>
                    {mode === "login"
                        ? "// ACCEDE A TU CUENTA"
                        : "// CREA TU CUENTA"}
                </div>

                <AuthForm
                    mode={mode}
                    onSubmit={handleSubmit}
                    onToggle={handleToggle}
                    isLoading={isLoading}
                    error={error}
                />
            </div>
        </div>
    );
}
