import Icon from '../ui/Icon';
import styles from './Promises.module.css';

const ICONS = ['package', 'cash', 'refresh', 'truck'];

// The 4 small "why shop with us" points under the hero
export default function Promises({ items = [] }) {
  return (
    <section className={styles.strip}>
      <div className={`container ${styles.grid}`}>
        {items.map((item, i) => (
          <div key={item.title} className={styles.item}>
            <Icon name={ICONS[i % ICONS.length]} size={26} strokeWidth={1} />
            <div>
              <h4>{item.title}</h4>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
