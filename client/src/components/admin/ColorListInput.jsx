import Icon from '../ui/Icon';
import styles from './ColorListInput.module.css';

// Edit a list of colours: [{ name: 'Blush', hex: '#e7c1b8' }]
export default function ColorListInput({ value = [], onChange }) {
  const update = (i, key, v) => onChange(value.map((c, n) => (n === i ? { ...c, [key]: v } : c)));

  return (
    <div className={styles.list}>
      {value.map((color, i) => (
        <div key={i} className={styles.row}>
          <input type="color" value={color.hex} onChange={(e) => update(i, 'hex', e.target.value)} aria-label="Colour" />
          <input value={color.name} onChange={(e) => update(i, 'name', e.target.value)} placeholder="Colour name" />
          <button type="button" onClick={() => onChange(value.filter((_, n) => n !== i))} aria-label="Remove colour">
            <Icon name="trash" size={16} />
          </button>
        </div>
      ))}
      <button type="button" className={styles.add} onClick={() => onChange([...value, { name: '', hex: '#e7c1b8' }])}>
        <Icon name="plus" size={14} /> Add colour
      </button>
    </div>
  );
}
