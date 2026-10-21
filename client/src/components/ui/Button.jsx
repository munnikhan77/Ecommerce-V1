import { Link } from 'react-router-dom';
import styles from './Button.module.css';

/**
 * <Button>Text</Button>                       → dark solid button
 * <Button variant="outline" to="/shop">       → renders a <Link>
 * <Button href="https://…">                   → external link, opens in new tab
 * variants: solid | outline | light | text      sizes: md | sm
 */
export default function Button({ variant = 'solid', size = 'md', full = false, to, loading, className = '', children, ...props }) {
  const classes = [styles.btn, styles[variant], styles[size], full && styles.full, className].filter(Boolean).join(' ');

  if (props.href) {
    return (
      <a className={classes} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    );
  }
  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading ? <span className={styles.spinner} /> : children}
    </button>
  );
}
