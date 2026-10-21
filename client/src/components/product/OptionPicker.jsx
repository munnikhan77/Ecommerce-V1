import styles from './OptionPicker.module.css';

/**
 * Size or colour selector.
 *   <OptionPicker label="Size" options={['S','M']} value={size} onChange={setSize} />
 *   <OptionPicker label="Colour" type="color" options={[{name, hex}]} … />
 */
export default function OptionPicker({ label, options, value, onChange, type = 'text' }) {
  if (!options?.length) return null;
  const isColor = type === 'color';

  return (
    <fieldset className={styles.picker}>
      <legend>
        {label}
        {value && <span>: {value}</span>}
      </legend>
      <div className={styles.options}>
        {options.map((opt) => {
          const name = isColor ? opt.name : opt;
          const selected = value === name;
          return (
            <button
              type="button"
              key={name}
              onClick={() => onChange(name)}
              className={`${isColor ? styles.swatch : styles.chip} ${selected ? styles.selected : ''}`}
              style={isColor ? { '--swatch': opt.hex } : undefined}
              aria-pressed={selected}
              title={name}
            >
              {isColor ? <span className="visually-hidden">{name}</span> : name}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
