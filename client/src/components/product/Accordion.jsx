import { useState } from 'react';
import Icon from '../ui/Icon';
import styles from './Accordion.module.css';

// items: [{ title, content }]
export default function Accordion({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className={styles.accordion}>
      {items.map((item, i) => (
        <div key={item.title} className={styles.item}>
          <button className={styles.head} onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
            {item.title}
            <Icon name={open === i ? 'minus' : 'plus'} size={16} />
          </button>
          <div className={`${styles.body} ${open === i ? styles.open : ''}`}>
            <div>{item.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
