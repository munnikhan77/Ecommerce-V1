import styles from './Panel.module.css';

// White rounded card used to group content in the admin
export default function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`${styles.panel} ${className}`}>
      {(title || action) && (
        <header className={styles.head}>
          {title && <h2>{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

// status picks the colour; label overrides the text (defaults to the status)
export function StatusBadge({ status, label }) {
  return <span className={`${styles.badge} ${styles[status] ?? ''}`}>{label ?? status}</span>;
}
