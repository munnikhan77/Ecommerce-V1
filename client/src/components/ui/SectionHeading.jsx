import Reveal from './Reveal';
import styles from './SectionHeading.module.css';

export default function SectionHeading({ eyebrow, title, action, align = 'left' }) {
  return (
    <Reveal className={`${styles.wrap} ${styles[align]}`}>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className={styles.title}>{title}</h2>
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </Reveal>
  );
}
