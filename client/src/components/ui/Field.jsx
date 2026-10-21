import styles from './Field.module.css';

/**
 * Labelled form input. Pass `as="textarea"` or `as="select"` for other controls.
 *   <Field label="Phone" name="phone" required />
 */
export default function Field({ label, as: Control = 'input', hint, children, className = '', ...props }) {
  return (
    <label className={`${styles.field} ${className}`}>
      <span className={styles.label}>{label}</span>
      <Control className={styles.control} {...props}>
        {children}
      </Control>
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  );
}

// Card-style radio button, e.g. delivery zone / payment method
export function RadioCard({ name, value, checked, onChange, title, text }) {
  return (
    <label className={`${styles.radio} ${checked ? styles.radioChecked : ''}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      <span className={styles.dot} />
      <span>
        <strong>{title}</strong>
        {text && <small>{text}</small>}
      </span>
    </label>
  );
}
