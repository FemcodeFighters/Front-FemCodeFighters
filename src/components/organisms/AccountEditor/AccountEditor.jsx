import { useState, useEffect } from "react";
import styles from "./AccountEditor.module.css";
import useAccountStore from "../../../store/useAccountStore";

const TABS = ["NOMBRE", "EMAIL", "PASSWORD"];

export default function AccountEditor({ onBack, onDeleteSuccess }) {
    const [activeTab, setActiveTab] = useState("NOMBRE");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);

    const {
        profile,
        isLoading,
        isSaving,
        error,
        success,
        fetchProfile,
        saveUsername,
        saveEmail,
        savePassword,
        removeAccount,
        clearMessages,
    } = useAccountStore();

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (profile) {
            setUsername(profile.username || "");
            setEmail(profile.email || "");
        }
    }, [profile]);

    useEffect(() => {
        clearMessages();
    }, [activeTab]);

    const handleSave = async () => {
        clearMessages();
        switch (activeTab) {
            case "NOMBRE":
                await saveUsername(username);
                break;
            case "EMAIL":
                await saveEmail(email);
                break;
            case "PASSWORD":
                await savePassword(currentPassword, newPassword);
                setCurrentPassword("");
                setNewPassword("");
                break;
        }
    };

    const handleDelete = async () => {
        await removeAccount(() => {
            onDeleteSuccess?.();
        });
    };

    if (isLoading) {
        return (
            <div className={styles.root}>
                <div className={styles.grid} />
                <div className={styles.loading}>// CARGANDO PERFIL...</div>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles.grid} />
            <div className={styles.scanlines} />

            <button className={styles.backBtn} onClick={onBack}>
                ← BACK
            </button>

            <div className={styles.header}>
                <div className={styles.headerTitle}>
                    ACCOUNT <span>EDITOR</span>
                </div>
                <div className={styles.headerSub}>// MANAGE YOUR ACCOUNT</div>
            </div>

            {profile && (
                <div className={styles.profileInfo}>
                    <span className={styles.profileLabel}>// USER:</span>
                    <span className={styles.profileValue}>
                        {profile.username}
                    </span>
                    <span className={styles.profileLabel}>// EMAIL:</span>
                    <span className={styles.profileValue}>{profile.email}</span>
                </div>
            )}

            <div className={styles.card}>
                <div className={styles.tabs}>
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === "NOMBRE" && (
                    <div className={styles.form}>
                        <div className={styles.fieldLabel}>// NUEVO NOMBRE</div>
                        <input
                            className={styles.input}
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Nuevo nombre de usuario"
                        />
                    </div>
                )}

                {activeTab === "EMAIL" && (
                    <div className={styles.form}>
                        <div className={styles.fieldLabel}>// NUEVO EMAIL</div>
                        <input
                            className={styles.input}
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nuevo email"
                        />
                    </div>
                )}

                {activeTab === "PASSWORD" && (
                    <div className={styles.form}>
                        <div className={styles.fieldLabel}>
                            // CONTRASEÑA ACTUAL
                        </div>
                        <input
                            className={styles.input}
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Contraseña actual"
                        />
                        <div className={styles.fieldLabel}>
                            // NUEVA CONTRASEÑA
                        </div>
                        <input
                            className={styles.input}
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nueva contraseña (mín. 6 caracteres)"
                        />
                    </div>
                )}

                {error && <div className={styles.error}>⚠ {error}</div>}
                {success && <div className={styles.success}>✓ {success}</div>}

                <div className={styles.actions}>
                    <button
                        className={styles.saveBtn}
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        <span>{isSaving ? "..." : "> GUARDAR"}</span>
                    </button>
                </div>

                <div className={styles.dangerZone}>
                    <div className={styles.dangerLabel}>// DANGER ZONE</div>
                    {!confirmDelete ? (
                        <button
                            className={styles.deleteBtn}
                            onClick={() => setConfirmDelete(true)}
                        >
                            ELIMINAR CUENTA
                        </button>
                    ) : (
                        <div className={styles.confirmDelete}>
                            <span className={styles.confirmText}>
                                ¿Segura? Esta acción no se puede deshacer.
                            </span>
                            <div className={styles.confirmActions}>
                                <button
                                    className={styles.confirmYes}
                                    onClick={handleDelete}
                                    disabled={isSaving}
                                >
                                    SÍ, ELIMINAR
                                </button>
                                <button
                                    className={styles.confirmNo}
                                    onClick={() => setConfirmDelete(false)}
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
