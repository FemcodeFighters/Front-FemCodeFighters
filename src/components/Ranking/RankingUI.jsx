import React from "react";
import styles from "./RankingUI.module.css";

const RankingUI = ({ data, onBack }) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.container}>
                <div className={styles.glitchWrapper}>
                    <h2 className={styles.title} data-text="HALL OF FAME">
                        HALL OF FAME
                    </h2>
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
                            {data.map((player, index) => {
                                const total = player.wins + player.losses;
                                const ratio =
                                    total > 0
                                        ? ((player.wins / total) * 100).toFixed(
                                              1,
                                          )
                                        : "0.0";

                                return (
                                    <tr
                                        key={player.username}
                                        className={
                                            index === 0 ? styles.topPlayer : ""
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
                            })}
                        </tbody>
                    </table>
                </div>

                <button className={styles.backButton} onClick={onBack}>
                    RETURN_TO_SYSTEM
                </button>
            </div>
        </div>
    );
};

export default RankingUI;
