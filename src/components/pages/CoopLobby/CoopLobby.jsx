import { useState } from "react";
import { createRoom, joinRoom } from "../../../service/coopApi";
import styles from "./CoopLobby.module.css";
import BackButton from "../../atoms/BackButton/BackButton";

export default function CoopLobby({ playerId, onRoomReady, onBack }) {
    const [mode, setMode] = useState(null);
    const [maxPlayers, setMaxPlayers] = useState(2);
    const [roomCode, setRoomCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreate = async () => {
        setLoading(true);
        setError("");
        try {
            const roomId = await createRoom(playerId, maxPlayers);
            onRoomReady(roomId, true);
        } catch (e) {
            setError("Error al crear la sala. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!roomCode.trim()) return setError("Introduce un código de sala.");
        setLoading(true);
        setError("");
        try {
            await joinRoom(roomCode.toUpperCase(), playerId);
            onRoomReady(roomCode.toUpperCase(), false);
        } catch (e) {
            setError("Sala no encontrada o ya ha empezado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.root}>
            <div className={styles.grid} />
            <div className={styles.scanlines} />
            <BackButton onBack={onBack} />

            <div className={styles.content}>
                <div className={styles.supertitle}>// CO-OP ONLINE</div>
                <div className={styles.title}>
                    UNIRSE AL <span>STACK</span>
                </div>

                {!mode && (
                    <div className={styles.cards}>
                        <button
                            className={styles.card}
                            onClick={() => setMode("create")}
                        >
                            <span className={styles.cardIcon}>🛠️</span>
                            <span className={styles.cardTitle}>CREAR SALA</span>
                            <span className={styles.cardDesc}>
                                Elige cuántas devs se unen y comparte el código
                            </span>
                        </button>
                        <button
                            className={styles.card}
                            onClick={() => setMode("join")}
                        >
                            <span className={styles.cardIcon}>🔗</span>
                            <span className={styles.cardTitle}>UNIRSE</span>
                            <span className={styles.cardDesc}>
                                Introduce el código que te ha compartido otra
                                dev
                            </span>
                        </button>
                    </div>
                )}

                {mode === "create" && (
                    <div className={styles.panel}>
                        <div className={styles.panelTitle}>CONFIGURAR SALA</div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                NÚMERO DE JUGADORAS
                            </label>
                            <div className={styles.playerOptions}>
                                {[2, 3, 4].map((n) => (
                                    <button
                                        key={n}
                                        className={
                                            maxPlayers === n
                                                ? styles.playerOptActive
                                                : styles.playerOpt
                                        }
                                        onClick={() => setMaxPlayers(n)}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.actions}>
                            <button
                                className={styles.btnSecondary}
                                onClick={() => {
                                    setMode(null);
                                    setError("");
                                }}
                            >
                                VOLVER
                            </button>
                            <button
                                className={styles.btnPrimary}
                                onClick={handleCreate}
                                disabled={loading}
                            >
                                {loading ? "CREANDO..." : "CREAR SALA →"}
                            </button>
                        </div>
                    </div>
                )}

                {mode === "join" && (
                    <div className={styles.panel}>
                        <div className={styles.panelTitle}>UNIRSE A SALA</div>

                        <div className={styles.field}>
                            <label className={styles.label}>
                                CÓDIGO DE SALA
                            </label>
                            <input
                                className={styles.input}
                                placeholder="Ej: A3F9B2C1"
                                value={roomCode}
                                onChange={(e) =>
                                    setRoomCode(e.target.value.toUpperCase())
                                }
                                maxLength={8}
                            />
                        </div>

                        {error && <div className={styles.error}>{error}</div>}

                        <div className={styles.actions}>
                            <button
                                className={styles.btnSecondary}
                                onClick={() => {
                                    setMode(null);
                                    setError("");
                                }}
                            >
                                VOLVER
                            </button>
                            <button
                                className={styles.btnPrimary}
                                onClick={handleJoin}
                                disabled={loading}
                            >
                                {loading ? "CONECTANDO..." : "UNIRSE →"}
                            </button>
                        </div>
                    </div>
                )}

                <div className={styles.divider} />
            </div>
        </div>
    );
}
