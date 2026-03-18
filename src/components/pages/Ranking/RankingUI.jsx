import React, { useEffect, useState } from "react";
import styles from "./RankingUI.module.css";

const RankingUI = ({ data = [], onBack }) => {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onBack) onBack();
        }, 10000);
        const interval = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [onBack]);
    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.glitchWrapper}>
                    <h2 className={styles.title}>HALL OF FAME</h2>
                    <div className={styles.divider}></div>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>RANK</th>
                                <th>FIGHTER</th>
                                <th>WINS</th>
                                <th>LOSSES</th>
                                <th>RATIO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((player, index) => {
                                    const total = player.wins + player.losses;
                                    const ratio =
                                        total > 0
                                            ? (
                                                  (player.wins / total) *
                                                  100
                                              ).toFixed(1)
                                            : "0.0";

                                    return (
                                        <tr
                                            key={player.username || index}
                                            className={
                                                index === 0
                                                    ? styles.topPlayer
                                                    : ""
                                            }
                                        >
                                            <td className={styles.rank}>
                                                #{index + 1}
                                            </td>
                                            <td className={styles.username}>
                                                {player.username}
                                            </td>
                                            <td className={styles.wins}>
                                                {player.wins}
                                            </td>
                                            <td className={styles.losses}>
                                                {player.losses}
                                            </td>
                                            <td className={styles.ratio}>
                                                {ratio}%
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        style={{
                                            textAlign: "center",
                                            padding: "20px",
                                        }}
                                    >
                                        NO DATA FOUND_
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={styles.footer}>
                    <p className={styles.redirectText}>
                        RETURNING TO MAIN_MENU IN {countdown}S...
                    </p>
                    <button className={styles.backButton} onClick={onBack}>
                        [ EXIT_NOW ]
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RankingUI;
