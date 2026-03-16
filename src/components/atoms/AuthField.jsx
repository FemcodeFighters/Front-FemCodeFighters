import styles from "../organisms/Auth/AuthUI.module.css";

export default function AuthField({
    label,
    type,
    placeholder,
    value,
    onChange,
    required,
    minLength,
    maxLength,
}) {
    return (
        <div className={styles.field}>
            <label className={styles.label}>{label}</label>
            <input
                className={styles.input}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                minLength={minLength}
                maxLength={maxLength}
            />
        </div>
    );
}
