import { useState } from "react";
import styles from "../organisms/Auth/AuthUI.module.css";
import AuthField from "../atoms/AuthField";
import AuthError from "../atoms/AuthError";
import AuthToggle from "../atoms/AuthToggle";

export default function AuthForm({
    mode,
    onSubmit,
    onToggle,
    isLoading,
    error,
}) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ username, email, password });
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {mode === "register" && (
                <AuthField
                    label="USERNAME"
                    type="text"
                    placeholder="tu_alias"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={2}
                    maxLength={50}
                />
            )}

            <AuthField
                label="EMAIL"
                type="email"
                placeholder="dev@codefighters.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <AuthField
                label="PASSWORD"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
            />

            <AuthError message={error} />

            <button
                className={styles.submitBtn}
                type="submit"
                disabled={isLoading}
            >
                <span>
                    {isLoading
                        ? "..."
                        : mode === "login"
                          ? "> ENTRAR"
                          : "> REGISTRARSE"}
                </span>
            </button>

            <div className={styles.divider} />

            <AuthToggle mode={mode} onToggle={onToggle} />
        </form>
    );
}
