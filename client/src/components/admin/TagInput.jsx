import { useState } from 'react';
import styles from './TagInput.module.css';

/** Type a value and press Enter to add it — used for sizes and fabric details */
export default function TagInput({ value = [], onChange, placeholder = 'Type and press Enter' }) {
  const [text, setText] = useState('');

  const add = () => {
    const v = text.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setText('');
  };

  return (
    <div className={styles.box}>
      {value.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
          <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} aria-label={`Remove ${tag}`}>
            ×
          </button>
        </span>
      ))}
      <input
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onBlur={add}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            add();
          }
        }}
      />
    </div>
  );
}
