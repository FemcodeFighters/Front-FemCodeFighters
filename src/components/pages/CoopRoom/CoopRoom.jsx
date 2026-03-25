import { useEffect, useState, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getRoomState, startCoopGame } from "../../../service/coopApi";
import styles from "./CoopRoom.module.css";
import BackButton from "../../atoms/BackButton/BackButton";

export default function CoopRoom({
    roomId,
    playerId,
    isHost,
    onGameStart,
    onBack,
}) {
    const [roomState, setRoomState] = useState(null);
    const [connected, setConnected] = useState(false);
    const [starting, setStarting] = useState(false);
    const stompRef = useRef(null);

    useEffect(() => {
        getRoomState(roomId).then(setRoomState).catch(console.error);
    }, [roomId]);

    useEffect(() => {
        if (roomState?.phase !== "WAITING" && roomState !== null) return;

        const interval = setInterval(() => {
            getRoomState(roomId).then(setRoomState).catch(console.error);
        }, 3000);

        return () => clearInterval(interval);
    }, [roomId, roomState?.phase]);

    useEffect(() => {
        const client = new Client({
            webSocketFactory: () => new SockJS("http://localhost:8080/ws-game"),
            onConnect: () => {
                setConnected(true);
                client.subscribe(`/topic/game/${roomId}`, (msg) => {
                    const state = JSON.parse(msg.body);
                    setRoomState(state);
                    if (state.phase === "PLAYING") {
                        onGameStart(roomId);
                    }
                });
            },
            onDisconnect: () => setConnected(false),
        });

        client.activate();
        stompRef.current = client;

        return () => client.deactivate();
    }, [roomId, onGameStart]);

    const handleStart = async () => {
        setStarting(true);
        try {
            await startCoopGame(roomId);
        } catch (e) {
            console.error("Error al iniciar la partida:", e);
            setStarting(false);
        }
    };

    const players = roomState ? Object.values(roomState.players) : [];
    const maxPlayers = roomState?.maxPlayers ?? 2;
    const canStart =
        isHost && players.length >= 2 && roomState?.phase === "WAITING";

    return (
        <div className={styles.root}>
            <div className={styles.grid} />
            <div className={styles.scanlines} />
            <BackButton onBack={onBack} />

            <div className={styles.content}>
                <div className={styles.supertitle}>// CO-OP ONLINE</div>
                <div className={styles.title}>
                    SALA <span>{roomId}</span>
                </div>

                <div className={styles.status}>
                    <span
                        className={
                            connected ? styles.dotOnline : styles.dotOffline
                        }
                    />
                    <span className={styles.statusText}>
                        {connected ? "CONECTADO AL SERVIDOR" : "CONECTANDO..."}
                    </span>
                </div>

                <div className={styles.codeBox}>
                    <span className={styles.codeLabel}>
                        COMPARTE ESTE CÓDIGO
                    </span>
                    <span className={styles.codeValue}>{roomId}</span>
                    <button
                        className={styles.copyBtn}
                        onClick={() => navigator.clipboard.writeText(roomId)}
                    >
                        COPIAR
                    </button>
                </div>

                <div className={styles.slots}>
                    {Array.from({ length: maxPlayers }).map((_, i) => {
                        const player = players[i];
                        return (
                            <div
                                key={i}
                                className={
                                    player
                                        ? styles.slotFilled
                                        : styles.slotEmpty
                                }
                            >
                                {player ? (
                                    <>
                                        <span className={styles.slotIcon}>
                                            👾
                                        </span>
                                        <span className={styles.slotName}>
                                            {player.playerId === playerId
                                                ? `${player.playerId} (TÚ)`
                                                : player.playerId}
                                        </span>
                                        <span className={styles.slotReady}>
                                            LISTA
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className={styles.slotIcon}>
                                            ⬜
                                        </span>
                                        <span className={styles.slotWaiting}>
                                            ESPERANDO...
                                        </span>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className={styles.footer}>
                    {!isHost && (
                        <div className={styles.waitingHost}>
                            Esperando a que el host inicie la partida...
                        </div>
                    )}
                    {isHost && (
                        <button
                            className={styles.btnStart}
                            onClick={handleStart}
                            disabled={!canStart || starting}
                        >
                            {starting
                                ? "INICIANDO..."
                                : canStart
                                  ? `INICIAR PARTIDA (${players.length}/${maxPlayers}) →`
                                  : `ESPERANDO JUGADORAS (${players.length}/${maxPlayers})`}
                        </button>
                    )}
                </div>

                <div className={styles.divider} />
            </div>
        </div>
    );
}
