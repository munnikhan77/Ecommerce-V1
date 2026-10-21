import { Link } from 'react-router-dom';
import Drawer from './Drawer';
import styles from './MobileMenu.module.css';

export default function MobileMenu({ open, onClose, categories, settings }) {
  return (
    <Drawer open={open} onClose={onClose} side="left" title={settings?.storeName}>
      <nav className={styles.nav}>
        <Link to="/shop">Shop All</Link>
        {categories.map((c) => (
          <Link key={c.id} to={`/shop?category=${c.slug}`}>
            {c.name}
          </Link>
        ))}
      </nav>
      {settings && (
        <div className={styles.contact}>
          <p className="eyebrow">Need help?</p>
          <a href={`tel:${settings.phone}`}>{settings.phone}</a>
        </div>
      )}
    </Drawer>
  );
}
