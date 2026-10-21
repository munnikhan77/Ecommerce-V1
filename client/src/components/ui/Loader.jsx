import styles from './Loader.module.css';

export function Loader({ label = 'Loading' }) {
  return (
    <div className={styles.loader} role="status">
      <span className={styles.moon} />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

// Grey boxes shown while a product grid loads
export function ProductSkeleton({ count = 4 }) {
  return Array.from({ length: count }, (_, i) => (
    <div key={i} className={styles.skeletonCard}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonLine} />
      <div className={styles.skeletonLine} style={{ width: '40%' }} />
    </div>
  ));
}

export function EmptyState({ title, text, children }) {
  return (
    <div className={styles.empty}>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
