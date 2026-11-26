import { Link } from 'react-router-dom';
import Drawer from './Drawer';
import { GENDERS, categoriesFor } from '../../utils/gender';
import styles from './MobileMenu.module.css';

export default function MobileMenu({ open, onClose, categories, settings }) {
  return (
    <Drawer open={open} onClose={onClose} side="left" title={settings?.storeName}>
      <nav className={styles.nav}>
        {GENDERS.map((g) => (
          <div key={g.key} className={styles.group}>
            <Link to={g.path} className={styles.groupTitle}>
              {g.label}
            </Link>
            {categoriesFor(categories, g.key).map((c) => (
              <Link key={c.id} to={`${g.path}?category=${c.slug}`} className={styles.sub}>
                {c.name}
              </Link>
            ))}
          </div>
        ))}
        <Link to="/shop">Shop All</Link>
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
