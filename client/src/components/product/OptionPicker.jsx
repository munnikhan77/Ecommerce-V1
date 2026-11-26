import styles from './OptionPicker.module.css';

/**
 * Size or colour selector.
 *   <OptionPicker label="Size" options={['S','M']} value={size} onChange={setSize} />
 *   <OptionPicker label="Colour" type="color" options={[{name, hex}]} … />
 * `invalid` turns the chips red and shakes them (e.g. Add to Bag pressed without a size).
 */
export default function OptionPicker({ label, options, value, onChange, type = 'text', invalid = false, pickerRef }) {
  if (!options?.length) return null;
  const isColor = type === 'color';

  return (
    <fieldset ref={pickerRef} className={`${styles.picker} ${invalid ? styles.invalid : ''}`}>
      <legend>
        {label}
        {value && <span>: {value}</span>}
        {invalid && <em className={styles.hint}> — please pick one</em>}
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
