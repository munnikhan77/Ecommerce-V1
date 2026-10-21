import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import Icon from '../ui/Icon';
import MobileMenu from './MobileMenu';
import styles from './Header.module.css';

export default function Header() {
  const { settings, categories } = useSettings();
  const { count, openCart } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // On the home page the header floats transparently over the hero until you scroll
  const overHero = pathname === '/' && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const onSearch = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q');
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  const navCategories = categories.slice(0, 3);

  return (
    <>
      <header className={`${styles.header} ${overHero ? styles.transparent : ''}`}>
        <div className={`container ${styles.inner}`}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={22} />
          </button>

          <nav className={styles.nav} aria-label="Main">
            <NavLink to="/shop" end>
              Shop All
            </NavLink>
            {navCategories.map((c) => (
              <NavLink key={c.id} to={`/shop?category=${c.slug}`}>
                {c.name}
              </NavLink>
            ))}
          </nav>

          <Link to="/" className={styles.logo}>
            {settings?.storeName ?? ''}
          </Link>

          <div className={styles.actions}>
            <button onClick={() => setSearchOpen((o) => !o)} aria-label="Search">
              <Icon name="search" />
            </button>
            <button onClick={openCart} className={styles.bag} aria-label={`Bag, ${count} items`}>
              <Icon name="bag" />
              {count > 0 && <span className={styles.count}>{count}</span>}
            </button>
          </div>
        </div>

        <form className={`${styles.search} ${searchOpen ? styles.searchOpen : ''}`} onSubmit={onSearch}>
          <div className="container">
            <input name="q" placeholder="Search satin, robes, bralettes…" autoComplete="off" tabIndex={searchOpen ? 0 : -1} />
          </div>
        </form>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} settings={settings} />
    </>
  );
}
