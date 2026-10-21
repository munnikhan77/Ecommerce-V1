import Icon from './Icon';
import styles from './QuantityPicker.module.css';

export default function QuantityPicker({ value, onChange, min = 1, max = 10, small = false }) {
  return (
    <div className={`${styles.picker} ${small ? styles.small : ''}`}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease">
        <Icon name="minus" size={14} />
      </button>
      <span aria-live="polite">{value}</span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase">
        <Icon name="plus" size={14} />
      </button>
    </div>
  );
}
