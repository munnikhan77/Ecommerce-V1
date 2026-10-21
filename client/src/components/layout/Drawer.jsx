import { useEffect } from 'react';
import Icon from '../ui/Icon';
import styles from './Drawer.module.css';

/** Slide-in panel used by the cart and the mobile menu */
export default function Drawer({ open, onClose, side = 'right', title, footer, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div className={`${styles.root} ${open ? styles.open : ''}`} aria-hidden={!open}>
      <div className={styles.backdrop} onClick={onClose} />
      <aside className={`${styles.panel} ${styles[side]}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className={styles.head}>
          <h3>{title}</h3>
          <button onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.foot}>{footer}</footer>}
      </aside>
    </div>
  );
}
