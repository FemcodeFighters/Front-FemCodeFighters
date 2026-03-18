import { useRef, useState, useEffect } from "react";
import { PhaserGame } from "./PhaserGame";
import { EventBus } from "./game/EventBus";
import MainMenuUI from "./components/pages/MainMenu/MainMenuUI";
import GameModeSelect from "./components/pages/GameMode/GameModeSelect";
import AuthUI from "./components/organisms/Auth/AuthUI";
import CharacterEditor from "./components/organisms/CharacterEditor/CharacterEditor";
import useAuthStore from "./store/useAuthStore";
import styles from "./App.module.css";
import useCharacterStore from "./store/useCharacterStore";
import AccountEditor from "./components/organisms/AccountEditor/AccountEditor";
import {
    useUltimateSkill,
    updateCombatStats,
    getRanking,
} from "./service/playerApi";
import RankingUI from "./components/pages/Ranking/RankingUI";
import ControlsOverlay from "./components/pages/ControlsOverlay/ControlsOverlay";
import CombatPopUp from "./components/molecules/CombatPopUp/CombatPopUp";

function Bar({ value, max, color, label }) {
    const safeValue = value ?? 0;
    const safeMax = max || 100;
    const pct = Math.max(0, Math.min(100, (safeValue / safeMax) * 100));
    return (
        <div className={styles.barWrapper}>
            <div className={styles.barHeader}>
                <span className={styles.barLabel}>{label}</span>
                <span className={styles.barLabel}>
                    {Math.round(safeValue)}/{safeMax}
                </span>
            </div>
            <div className={styles.barBg}>
                <div
                    className={styles.barFill}
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    );
}

function UltimateBar({ energy, max, ready }) {
    const pct = Math.max(0, Math.min(100, (energy / max) * 100));
    return (
        <div className={styles.ultimateWrapper}>
            <div className={styles.ultimateHeader}>
                <span
                    className={
                        ready
                            ? styles.ultimateLabelReady
                            : styles.ultimateLabelIdle
                    }
                >
                    ⚡ ULTIMATE {ready ? "— PULSA R" : ""}
                </span>
                <span className={styles.ultimatePct}>{Math.round(pct)}%</span>
            </div>
            <div
                className={
                    ready ? styles.ultimateBgReady : styles.ultimateBgIdle
                }
            >
                <div
                    className={
                        ready
                            ? styles.ultimateFillReady
                            : styles.ultimateFillIdle
                    }
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function CooldownBar({ ready, label, color }) {
    return (
        <div className={styles.cooldownItem}>
            <span className={styles.cooldownKey}>{label}</span>
            <div
                className={styles.cooldownDot}
                style={{
                    background: ready ? color : "#333",
                    border: `1px solid ${ready ? color : "#555"}`,
                    boxShadow: ready ? `0 0 6px ${color}` : "none",
                }}
            />
            <span
                className={styles.cooldownText}
                style={{ color: ready ? color : "#555" }}
            >
                {ready ? "LISTO" : "CD..."}
            </span>
        </div>
    );
}

function CombatHUD({ playerHp, enemyHp, playerCooldowns, ultimateState }) {
    return (
        <div className={styles.hud}>
            <div className={styles.hudPlayer}>
                <Bar
                    value={playerHp.hp}
                    max={playerHp.max}
                    color="#7c3aed"
                    label="PROGRAMADORA"
                />
                <UltimateBar
                    energy={ultimateState.energy}
                    max={ultimateState.max}
                    ready={ultimateState.ready}
                />
                <div className={styles.cooldowns}>
                    <CooldownBar
                        ready={playerCooldowns.attack}
                        label="F"
                        color="#f59e0b"
                    />
                    <CooldownBar
                        ready={playerCooldowns.ranged}
                        label="G"
                        color="#00ccff"
                    />
                </div>
            </div>
            <span className={styles.hudVs}>VS</span>
            <div className={styles.hudEnemy}>
                <Bar
                    value={enemyHp.hp}
                    max={enemyHp.max}
                    color="#f7df1e"
                    label="STACK"
                />
            </div>
        </div>
    );
}

function App() {
    const phaserRef = useRef();
    const [ranking, setRanking] = useState([]);
    const [screen, setScreen] = useState("");
    const [showCredits, setShowCredits] = useState(false);
    const { isAuthenticated, user, logout } = useAuthStore();
    const [combatSessionId, setCombatSessionId] = useState(0);
    const [playerHp, setPlayerHp] = useState({ hp: 100, max: 100 });
    const [enemyHp, setEnemyHp] = useState({ hp: 100, max: 100 });
    const [playerCooldowns, setPlayerCooldowns] = useState({
        attack: true,
        ranged: true,
    });
    const [ultimateState, setUltimateState] = useState({
        energy: 0,
        max: 100,
        ready: false,
    });
    const [isDamaged, setIsDamaged] = useState(false);

    const resetCombatStats = () => {
        setPlayerHp({ hp: 100, max: 100 });
        setEnemyHp({ hp: 100, max: 100 });
        setPlayerCooldowns({ attack: true, ranged: true });
        setUltimateState({ energy: 0, max: 100, ready: false });
        setIsDamaged(false);
        setCombatSessionId((prev) => prev + 1);
    };

    useEffect(() => {
        const handleCombatResult = async ({ winner }) => {
            try {
                await updateCombatStats(winner === "player");
                const { fetchCharacter } = useCharacterStore.getState();
                if (fetchCharacter) await fetchCharacter();
                const topPlayers = await getRanking();
                setRanking(topPlayers);
                setScreen("ranking");
            } catch (error) {
                console.error("Error al procesar resultado:", error);
                setScreen("ranking");
            }
        };

        const handleRequestUltimate = async () => {
            try {
                await useUltimateSkill();
            } catch (e) {
                console.error("Error al registrar Ultimate en DB", e);
            }
        };

        const handlePlayerDamaged = () => {
            setIsDamaged(true);
            setTimeout(() => setIsDamaged(false), 300);
        };

        EventBus.on("combat-result", handleCombatResult);
        EventBus.on("player-damaged", handlePlayerDamaged);
        EventBus.on("request-ultimate", handleRequestUltimate);
        EventBus.on("player-health", ({ hp, maxHP }) =>
            setPlayerHp({ hp, max: maxHP }),
        );
        EventBus.on("enemy-health", ({ hp, maxHP }) =>
            setEnemyHp({ hp, max: maxHP }),
        );
        EventBus.on("player-cooldown-attack", (ready) =>
            setPlayerCooldowns((p) => ({ ...p, attack: ready })),
        );
        EventBus.on("player-cooldown-ranged", (ready) =>
            setPlayerCooldowns((p) => ({ ...p, ranged: ready })),
        );
        EventBus.on("player-ultimate", (data) => setUltimateState(data));

        getRanking().then(setRanking);

        return () => {
            EventBus.removeAllListeners("combat-result");
            EventBus.removeAllListeners("player-damaged");
            EventBus.removeAllListeners("request-ultimate");
            EventBus.removeAllListeners("player-health");
            EventBus.removeAllListeners("enemy-health");
            EventBus.removeAllListeners("player-cooldown-attack");
            EventBus.removeAllListeners("player-cooldown-ranged");
            EventBus.removeAllListeners("player-ultimate");
        };
    }, [combatSessionId]);

    const currentScene = (scene) => {
        const key = scene.scene.key;
        if (key === "MainMenu") setScreen("mainmenu");
        else if (key === "CombatScene") setScreen("combat");
    };

    const handleSelectSolo = () => {
        resetCombatStats();
        setScreen("combat");
        if (phaserRef.current) {
            setTimeout(() => {
                EventBus.emit("start-solo-game");
            }, 100);
        }
    };

    const handleBackToMenu = () => {
        setScreen("mainmenu");
        if (phaserRef.current) {
            const game = phaserRef.current.game;
            game.scene.stop("CombatScene");
            game.scene.start("MainMenu");
        }
    };

    return (
        <div id="app" className={styles.app}>
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

            {screen === "mainmenu" && (
                <MainMenuUI
                    onPlay={() => {
                        setShowCredits(false);
                        setScreen(isAuthenticated ? "editor" : "auth");
                    }}
                    onCredits={() => setShowCredits(true)}
                    showCredits={showCredits}
                    onCloseCredits={() => setShowCredits(false)}
                    user={user}
                    onLogout={() => {
                        logout();
                        setScreen("mainmenu");
                    }}
                    onRanking={() => setScreen("ranking")}
                />
            )}

            {screen === "auth" && (
                <AuthUI
                    onBack={() => setScreen("mainmenu")}
                    onSuccess={() => setScreen("editor")}
                />
            )}

            {screen === "editor" && (
                <CharacterEditor
                    onBack={() =>
                        setScreen(isAuthenticated ? "mainmenu" : "auth")
                    }
                    onContinue={() => setScreen("instructions")}
                    onLogout={() => {
                        logout();
                        setScreen("mainmenu");
                    }}
                    onEditAccount={() => setScreen("account")}
                />
            )}

            {screen === "instructions" && (
                <ControlsOverlay
                    onDismiss={() => setScreen("gamemode")}
                    onBack={() => setScreen("editor")}
                />
            )}

            {screen === "gamemode" && (
                <GameModeSelect
                    onSelectSolo={handleSelectSolo}
                    onBack={() => setScreen("instructions")}
                />
            )}

            {screen === "combat" && (
                <div
                    key={`session-${combatSessionId}`}
                    className={`${styles.hudContainer} ${isDamaged ? styles.shake : ""}`}
                >
                    <CombatPopUp />
                    <CombatHUD
                        playerHp={playerHp}
                        enemyHp={enemyHp}
                        playerCooldowns={playerCooldowns}
                        ultimateState={ultimateState}
                    />
                </div>
            )}

            {screen === "account" && (
                <AccountEditor
                    onBack={() => setScreen("editor")}
                    onDeleteSuccess={() => {
                        logout();
                        setScreen("mainmenu");
                    }}
                />
            )}

            {screen === "ranking" && (
                <RankingUI data={ranking} onBack={handleBackToMenu} />
            )}
        </div>
    );
}

export default App;
