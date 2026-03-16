import { useRef, useState, useEffect } from "react";
import { PhaserGame } from "./PhaserGame";
import { EventBus } from "./game/EventBus";
import MainMenuUI from "./components/MainMenu/MainMenuUI";
import GameModeSelect from "./components/GameMode/GameModeSelect";
import AuthUI from "./components/organisms/Auth/AuthUI";
import CharacterEditor from "./components/organisms/CharacterEditor/CharacterEditor";
import useAuthStore from "./store/useAuthStore";
import styles from "./App.module.css";
import useCharacterStore from './store/useCharacterStore';

function Bar({ value, max, color, label }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    return (
        <div className={styles.barWrapper}>
            <div className={styles.barHeader}>
                <span className={styles.barLabel}>{label}</span>
                <span className={styles.barLabel}>
                    {value}/{max}
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
                    label="PLAYER"
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
                    label="JAVASCRIPT"
                />
            </div>
        </div>
    );
}

// Flujo de pantallas:
// mainmenu → auth → editor → gamemode → combat
function App() {
    const phaserRef = useRef();
    const [screen, setScreen] = useState("");
    const [showCredits, setShowCredits] = useState(false);

    const { isAuthenticated, user, logout } = useAuthStore();

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

    useEffect(() => {
        EventBus.on("player-health", ({ hp, maxHP }) =>
            setPlayerHp({ hp, max: maxHP }),
        );
        EventBus.on("enemy-health", ({ hp, maxHP }) =>
            setEnemyHp({ hp, max: maxHP }),
        );
        EventBus.on("player-cooldown-attack", (ready) =>
            setPlayerCooldowns((prev) => ({ ...prev, attack: ready })),
        );
        EventBus.on("player-cooldown-ranged", (ready) =>
            setPlayerCooldowns((prev) => ({ ...prev, ranged: ready })),
        );
        EventBus.on("player-ultimate", ({ energy, max, ready }) =>
            setUltimateState({ energy, max, ready }),
        );
        return () => {
            EventBus.removeListener("player-health");
            EventBus.removeListener("enemy-health");
            EventBus.removeListener("player-cooldown-attack");
            EventBus.removeListener("player-cooldown-ranged");
            EventBus.removeListener("player-ultimate");
        };
    }, []);

    const currentScene = (scene) => {
        const key = scene.scene.key;
        if (key === "MainMenu") setScreen("mainmenu");
        else if (key === "CombatScene") setScreen("combat");
        else setScreen("");
    };

    const handlePlay = () => {
        setShowCredits(false);
        if (!isAuthenticated) {
            setScreen("auth");
        } else {
            setScreen("editor");
        }
    };

    const handleAuthSuccess = () => setScreen("editor");
    const handleEditorBack = () =>
        setScreen(isAuthenticated ? "mainmenu" : "auth");
    const handleEditorContinue = () => setScreen("gamemode");
    const handleSelectSolo = () => {
        const scene = phaserRef.current?.scene;
        if (scene?.scene.key === "MainMenu") {
            const character = useCharacterStore.getState().character;
            scene.registry.set('character', character); 
            EventBus.emit("character-data", character);
            scene.changeScene();
        }
    };

    return (
        <div id="app" className={styles.app}>
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />

            {screen === "mainmenu" && (
                <MainMenuUI
                    onPlay={handlePlay}
                    onCredits={() => setShowCredits(true)}
                    showCredits={showCredits}
                    onCloseCredits={() => setShowCredits(false)}
                    user={user}
                    onLogout={() => {
                        logout();
                        setScreen("mainmenu");
                    }}
                />
            )}

            {screen === "auth" && (
                <AuthUI
                    onBack={() => setScreen("mainmenu")}
                    onSuccess={handleAuthSuccess}
                />
            )}

            {screen === "editor" && (
                <CharacterEditor
                    onBack={handleEditorBack}
                    onContinue={handleEditorContinue}
                />
            )}

            {screen === "gamemode" && (
                <GameModeSelect
                    onSelectSolo={handleSelectSolo}
                    onBack={() => setScreen("editor")}
                />
            )}

            {screen === "combat" && (
                <CombatHUD
                    playerHp={playerHp}
                    enemyHp={enemyHp}
                    playerCooldowns={playerCooldowns}
                    ultimateState={ultimateState}
                />
            )}
        </div>
    );
}

export default App;
