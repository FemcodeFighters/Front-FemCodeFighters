import { useEffect, useRef } from "react";
import styles from "./MainMenuUI.module.css";
import { EventBus } from "../../../game/EventBus";

export default function MainMenuUI({
    onPlay,
    onCredits,
    showCredits,
    onCloseCredits,
}) {
    const particlesRef = useRef(null);

    useEffect(() => {
        const container = particlesRef.current;
        if (!container) return;

        const particles = [];
        for (let i = 0; i < 30; i++) {
            const p = document.createElement("div");
            p.style.cssText = `
                position: absolute;
                width: 2px; height: 2px;
                background: #00ffc8;
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${0.2 + Math.random() * 0.6};
            `;
            container.appendChild(p);
            particles.push({
                el: p,
                speed: 0.3 + Math.random() * 0.8,
                top: Math.random() * 100,
            });
        }

        let frame;
        const animate = () => {
            particles.forEach((p) => {
                p.top -= p.speed * 0.05;
                if (p.top < -2) p.top = 102;
                p.el.style.top = p.top + "%";
            });
            frame = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(frame);
            particles.forEach((p) => p.el.remove());
        };
    }, []);

    const handlePlay = () => {
        EventBus.emit("user-interacted");
        onPlay();
    };

    const handleCredits = () => {
        EventBus.emit("user-interacted");
        onCredits();
    };

    return (
        <div className={styles.root}>
            <div className={styles.grid} />
            <div className={styles.scanlines} />
            <div
                className={styles.glitchLine}
                style={{
                    top: "30%",
                    animationDelay: "0s",
                    animationDuration: "4s",
                }}
            />
            <div
                className={styles.glitchLine}
                style={{
                    top: "62%",
                    animationDelay: "2s",
                    animationDuration: "6s",
                }}
            />
            <div
                className={styles.glitchLine}
                style={{
                    top: "80%",
                    animationDelay: "1s",
                    animationDuration: "5s",
                }}
            />
            <div ref={particlesRef} className={styles.particles} />
            <div className={styles.content}>
                <div className={styles.supertitle}>
                    // root@ragnarok:~$ ./game.exe
                </div>

                <div className={styles.titleRow}>
                    <span className={styles.titleWhite}>CODE</span>
                    <span className={styles.titleCyan}>FIGHTERS</span>
                </div>

                <div className={styles.divider} />

                <div className={styles.tagline}>
                    debug them all &gt;&gt; fight the stack
                </div>

                <div className={styles.buttons}>
                    <button className={styles.playBtn} onClick={handlePlay}>
                        <span>&gt; PLAY</span>
                    </button>
                    <button
                        className={styles.secondaryBtn}
                        onClick={handleCredits}
                    >
                        CREDITS
                    </button>
                </div>
            </div>
            <div className={styles.version}>v0.1.0 — alpha</div>
            {showCredits && (
                <div className={styles.creditsOverlay}>
                    <div className={styles.creditsTitle}>// CREDITS</div>
                    <div className={styles.creditsLabel}>DEVELOPED BY</div>
                    <div className={styles.creditsValue}>JENNIFER CROS</div>
                    <div style={{ height: 8 }} />
                    <div className={styles.creditsLabel}>BUILT WITH</div>
                    <div className={styles.creditsValueCyan}>
                        PHASER 3 + REACT + VITE
                    </div>
                    <button
                        className={styles.secondaryBtn}
                        onClick={onCloseCredits}
                        style={{ marginTop: 24 }}
                    >
                        &lt; BACK
                    </button>
                </div>
            )}
        </div>
    );
}
