import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import Icon from '../ui/Icon';
import styles from './Footer.module.css';

export default function Footer() {
  const { settings, categories } = useSettings();
  if (!settings) return null;

  const socials = Object.entries(settings.social ?? {}).filter(([, url]) => url);

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            {settings.storeName}
          </Link>
          <p>{settings.tagline}</p>
          <div className={styles.socials}>
            {socials.map(([name, url]) => (
              <a key={name} href={url} target="_blank" rel="noreferrer" aria-label={name}>
                <Icon name={name} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            {categories.map((c) => (
              <li key={c.id}>
                <Link to={`/shop?category=${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Help</h4>
          <ul>
            <li>Delivery all over Nepal</li>
            <li>Cash on Delivery · eSewa · Khalti</li>
            <li>7-day size exchange</li>
            <li>Discreet packaging</li>
          </ul>
        </div>

        <div>
          <h4>Contact</h4>
          <ul>
            <li>
              <a href={`tel:${settings.phone}`}>{settings.phone}</a>
            </li>
            <li>
              <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </li>
            <li>{settings.address}</li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>
          © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
        </span>
        <span>Made with love in Nepal</span>
      </div>
    </footer>
  );
}
