import React from 'react';
import { ULTIMATE_INFO } from '../../../constants/UltimateSkills';
import useCharacterStore from "../../../store/useCharacterStore";
import styles from './UltimateSelector.module.css';

export default function UltimateSelector() {
    const { character, setUltimate } = useCharacterStore();
    
    const currentSkill = ULTIMATE_INFO[character.ultimateSkill] || ULTIMATE_INFO.FRIDAY_DEPLOY;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>// SELECT_ULTIMATE_MODULE</h3>
            
            <div className={styles.grid}>
                {Object.values(ULTIMATE_INFO).map((skill) => (
                    <button
                        key={skill.id}
                        className={`${styles.skillCard} ${character.ultimateSkill === skill.id ? styles.active : ''}`}
                        onClick={() => setUltimate(skill.id)}
                    >
                        <span className={styles.icon}>{skill.icon}</span>
                        <span className={styles.name}>{skill.name}</span>
                    </button>
                ))}
            </div>

            <div className={styles.infoBox} style={{ borderColor: currentSkill.color }}>
                <div className={styles.infoHead}>
                    <span className={styles.status}>[SYSTEM_READY]</span>
                    <span className={styles.skillTitle} style={{ color: currentSkill.color }}>
                        {currentSkill.name.toUpperCase()}
                    </span>
                </div>
                <p className={styles.description}>{currentSkill.description}</p>
                <div className={styles.stats}>
                    <code>OUTPUT: {currentSkill.stats}</code>
                </div>
            </div>
        </div>
    );
}