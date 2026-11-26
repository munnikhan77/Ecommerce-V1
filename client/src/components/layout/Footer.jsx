import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import Icon from '../ui/Icon';
import Stars from '../saanjh/Stars';
import { GENDERS, categoriesFor } from '../../utils/gender';
import styles from './Footer.module.css';

export default function Footer() {
  const { settings, categories } = useSettings();
  const ref = useRef(null);
  // phones: the link columns fold into tap-to-open rows (only one open at a time)
  const [openCol, setOpenCol] = useState('');
  const toggle = (key) => setOpenCol((k) => (k === key ? '' : key));

  // nightfall: --night goes 0 → 1 as the footer rises into view (sunset → night sky)
  useEffect(() => {
    const footer = ref.current;
    if (!footer) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = footer.getBoundingClientRect();
      // short desktop footer: most of its height; tall phone footer: about half a screen
      const travel = Math.min(height * 0.85, window.innerHeight * 0.6);
      const night = Math.min(1, Math.max(0, (window.innerHeight - top) / travel));
      footer.style.setProperty('--night', night.toFixed(3));
      // moonrise: the moon climbs to the middle of the sky over the last stretch of the page —
      // or, on a tall phone footer, once the footer's sky reaches the top of the screen
      const left = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
      const nearEnd = 1 - left / 180;
      const skyAtTop = (window.innerHeight * 0.3 - top) / 160;
      const end = Math.min(1, Math.max(0, nearEnd, skyAtTop));
      footer.style.setProperty('--end', end.toFixed(3));
    };
    const onScroll = () => frame || (frame = requestAnimationFrame(update));
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [settings]);

  if (!settings) return null;

  const socials = Object.entries(settings.social ?? {}).filter(([, url]) => url);

  return (
    <footer ref={ref} className={styles.footer}>
      {/* saanjh turning into night: sunset sky fades out, the sun sinks, the moon and stars come out */}
      <span className={styles.sunset} aria-hidden="true" />
      {settings.content.mood.stars && <Stars count={60} seed={21} className={styles.stars} />}
      {/* the sky strip above the columns: the sun sinks below its horizon, the moon rises from it */}
      <div className={styles.horizon} aria-hidden="true">
        <span className={styles.sun} />
        <span className={styles.moon} />
      </div>
      {settings.content.footer.goodnight && (
        <span className={styles.goodnight} aria-hidden="true">
          {settings.content.footer.goodnight}
        </span>
      )}
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Link to="/" className={styles.logo} aria-label={settings.storeName}>
            {settings.storeNameNepali && <span className={styles.logoNepali}>{settings.storeNameNepali}</span>}
            <span className={settings.storeNameNepali ? styles.logoLatin : ''}>{settings.storeName}</span>
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

        {GENDERS.map((g) => (
          <Column key={g.key} title={<Link to={g.path}>{g.label}</Link>} label={g.label} open={openCol === g.key} onToggle={() => toggle(g.key)}>
            {categoriesFor(categories, g.key).map((c) => (
              <li key={c.id}>
                <Link to={`${g.path}?category=${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </Column>
        ))}

        <Column title="Help" label="Help" open={openCol === 'help'} onToggle={() => toggle('help')}>
          {settings.content.footer.help.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </Column>

        <div className={styles.contact}>
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
          {/* phones: two big buttons instead of the list */}
          <div className={styles.quick}>
            <a href={`tel:${settings.phone}`}>Call us</a>
            <a href={`mailto:${settings.email}`}>Email</a>
          </div>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>
          © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
        </span>
        <span>{settings.content.footer.note}</span>
      </div>
    </footer>
  );
}

// a footer link column; on phones its list folds away behind the + button
function Column({ title, label, open, onToggle, children }) {
  return (
    <div className={`${styles.col} ${open ? styles.open : ''}`}>
      <h4>
        {title}
        <button type="button" className={styles.toggle} onClick={onToggle} aria-expanded={open} aria-label={`${open ? 'Hide' : 'Show'} ${label} links`}>
          <Icon name="plus" size={16} />
        </button>
      </h4>
      <ul>{children}</ul>
    </div>
  );
}
