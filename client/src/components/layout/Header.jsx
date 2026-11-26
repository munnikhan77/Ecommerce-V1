import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import Icon from '../ui/Icon';
import MobileMenu from './MobileMenu';
import ProductImage from '../ui/ProductImage';
import { GENDERS, categoriesFor } from '../../utils/gender';
import SearchOverlay from './SearchOverlay';
import styles from './Header.module.css';

const HEADER_H = 72; // matches --header-h in global.css

export default function Header() {
  const { settings, categories } = useSettings();
  const { count, openCart } = useCart();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  // a mega menu stays shut after a click inside it until the mouse leaves (otherwise hover keeps it open)
  const [megaClosed, setMegaClosed] = useState('');
  const closeMega = (key) => {
    setMegaClosed(key);
    document.activeElement?.blur(); // drop focus too, or :focus-within would hold it open
  };

  // Pages that open with a big photo (home hero, the Women / Men banners): the header floats
  // transparently over it — on home until the next page slides up under it, elsewhere until you scroll
  const isHome = ['/', '/women', '/men'].includes(pathname);
  const overHero = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => {
      const nextPage = document.getElementById('after-hero');
      setScrolled(nextPage ? nextPage.getBoundingClientRect().top <= HEADER_H : window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  return (
    <>
      <header className={`${styles.header} ${isHome ? styles.floating : ''} ${overHero ? styles.transparent : ''}`}>
        <div className={`container ${styles.inner}`}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Icon name="menu" size={22} />
          </button>

          <nav className={styles.nav} aria-label="Main">
            {GENDERS.map((g) => {
              const cats = categoriesFor(categories, g.key);
              return (
                <div key={g.key} className={styles.navItem} onMouseLeave={() => setMegaClosed('')}>
                  <NavLink to={g.path} onClick={() => closeMega(g.key)}>
                    {g.label}
                  </NavLink>
                  {cats.length > 0 && (
                    <div className={`${styles.mega} ${megaClosed === g.key ? styles.megaOff : ''}`}>
                      <div className={`container ${styles.megaInner}`}>
                        <div className={styles.megaLinks}>
                          <p className="eyebrow">{g.label}</p>
                          <Link to={g.path} onClick={() => closeMega(g.key)} className={styles.megaAll}>
                            Shop all {g.label.toLowerCase()}
                          </Link>
                          {cats.map((c) => (
                            <Link key={c.id} to={`${g.path}?category=${c.slug}`} onClick={() => closeMega(g.key)}>
                              {c.name}
                            </Link>
                          ))}
                        </div>
                        <div className={styles.megaCards}>
                          {cats.slice(0, 3).map((c) => (
                            <Link key={c.id} to={`${g.path}?category=${c.slug}`} onClick={() => closeMega(g.key)} className={styles.megaCard}>
                              <ProductImage src={c.image || c.cutout} tone={c.tone} alt={c.name} ratio="3 / 4" />
                              <span>{c.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <NavLink to="/shop" end>
              Shop All
            </NavLink>
          </nav>

          {/* साँझ in Devanagari, the Latin name small underneath */}
          <Link to="/" className={styles.logo} aria-label={settings?.storeName}>
            {settings?.storeNameNepali && <span className={styles.logoNepali}>{settings.storeNameNepali}</span>}
            <span className={settings?.storeNameNepali ? styles.logoLatin : ''}>{settings?.storeName ?? ''}</span>
          </Link>

          <div className={styles.actions}>
            <button onClick={() => setSearchOpen(true)} aria-label="Search">
              <Icon name="search" />
            </button>
            <button onClick={openCart} className={styles.bag} aria-label={`Bag, ${count} items`}>
              <Icon name="bag" />
              {count > 0 && <span className={styles.count}>{count}</span>}
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={closeSearch} categories={categories} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories} settings={settings} />
    </>
  );
}
