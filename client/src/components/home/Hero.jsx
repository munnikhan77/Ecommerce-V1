import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import Price from '../ui/Price';
import styles from './Hero.module.css';

const SIDES = 2; // cards shown on each side of the model
const AUTO_MS = 5200; // auto-advance until the visitor touches something

const TABS = [
  { key: 'women', label: 'Girls' },
  { key: 'men', label: 'Boys' },
];

/**
 * Hero — the fitting room.
 * A model stands in a warm arched room; the pieces hang as glass cards either side.
 * Pick a card (or use the arrows / keys / swipe) and the model changes into it.
 * Fully data-driven: any product with a "Fitting room look" (admin → product) appears here,
 * under Girls or Boys depending on its category.
 */
export default function Hero() {
  const { settings, categories } = useSettings();
  const { addItem } = useCart();
  const { data: products } = useFetch(() => api.getProducts({ limit: 100 }), []);

  const [tab, setTab] = useState('women');
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [size, setSize] = useState('');
  const [color, setColor] = useState(0);
  const [auto, setAuto] = useState(true);
  const touch = useRef(null);

  const genderOfCat = useMemo(
    () => Object.fromEntries((categories ?? []).map((c) => [c.id, c.gender ?? 'women'])),
    [categories],
  );

  const looks = useMemo(() => {
    const all = (products ?? []).filter((p) => p.lookImage);
    return {
      women: all.filter((p) => ['women', 'unisex'].includes(genderOfCat[p.categoryId])),
      men: all.filter((p) => ['men', 'unisex'].includes(genderOfCat[p.categoryId])),
    };
  }, [products, genderOfCat]);

  const list = looks[tab];
  const n = list.length;
  const current = n ? list[((index % n) + n) % n] : null;

  // preload every look so switching is instant
  useEffect(() => {
    [...looks.women, ...looks.men].forEach((p) => {
      const img = new Image();
      img.src = p.lookImage;
    });
  }, [looks]);

  // reset choices whenever the piece changes
  useEffect(() => {
    setSize('');
    setColor(0);
  }, [current?.id]);

  const go = useCallback(
    (step, manual = true) => {
      if (manual) setAuto(false);
      setDir(step >= 0 ? 1 : -1);
      setIndex((i) => i + step);
    },
    [],
  );

  const switchTab = (key) => {
    if (key === tab) return;
    setAuto(false);
    setDir(key === 'men' ? 1 : -1);
    setTab(key);
    setIndex(0);
  };

  // gentle auto-play like a shop window, stops after the first interaction
  useEffect(() => {
    if (!auto || n < 2) return;
    const t = setInterval(() => go(1, false), AUTO_MS);
    return () => clearInterval(t);
  }, [auto, n, go]);

  // arrow keys while the hero is on screen
  useEffect(() => {
    const onKey = (e) => {
      if (window.scrollY > window.innerHeight * 0.5) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const onTouchStart = (e) => (touch.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touch.current == null) return;
    const dx = e.changedTouches[0].clientX - touch.current;
    touch.current = null;
    if (Math.abs(dx) > 45) go(dx < 0 ? 1 : -1);
  };

  const addToBag = () => {
    if (!current) return;
    const sizes = current.sizes ?? [];
    const chosen = size || (sizes.length === 1 ? sizes[0] : sizes.includes('M') ? 'M' : sizes[0] ?? '');
    const col = current.colors?.[color];
    addItem({
      productId: current.id,
      slug: current.slug,
      name: current.name,
      price: current.price,
      image: current.images?.[0] ?? current.lookImage,
      tone: col?.hex,
      size: chosen,
      color: col?.name ?? '',
      quantity: 1,
    });
  };

  // the cards either side: offsets -2, -1 | +1, +2
  const sideCards = [];
  if (n > 1) {
    for (let o = -SIDES; o <= SIDES; o++) {
      if (o === 0) continue;
      if (o > 0 ? o > Math.ceil((n - 1) / 2) : -o > Math.floor((n - 1) / 2)) continue;
      const p = list[(((index + o) % n) + n) % n];
      sideCards.push({ o, p });
    }
  }

  const brand = settings?.storeName || 'Saanjh';

  return (
    <section className={styles.hero} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      {/* ---------- the room ---------- */}
      <div className={styles.room} aria-hidden="true">
        <div className={styles.arch} />
        <div className={styles.sun} />
        <div className={styles.curtain} />
        <div className={styles.bench} />
        <div className={styles.floor} />
        <div className={styles.grain} />
      </div>

      {/* Girls / Boys */}
      <div className={styles.tabs} role="tablist" aria-label="Fitting room">
        <span className={styles.tabPill} style={{ transform: `translateX(${tab === 'men' ? 100 : 0}%)` }} />
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={tab === t.key ? styles.tabOn : ''}
            onClick={() => switchTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <h1 className={styles.brand}>
        <span key={tab}>{brand}</span>
      </h1>

      {/* ---------- the model ---------- */}
      <div className={styles.stage}>
        {current && (
          <img
            key={`${tab}-${current.id}`}
            src={current.lookImage}
            alt={`Model wearing ${current.name}`}
            className={styles.model}
            style={{ '--from': `${dir * 60}px` }}
            draggable={false}
          />
        )}
        <span className={styles.shadow} />
      </div>

      {/* ---------- the cards ---------- */}
      <div className={styles.cards}>
        {sideCards.map(({ o, p }) => (
          <button
            key={`${tab}-${p.id}-${o}`}
            type="button"
            className={`${styles.card} ${Math.abs(o) === 1 ? styles.near : styles.far}`}
            style={{ '--o': o }}
            onClick={() => go(o)}
            aria-label={`Try on ${p.name}`}
          >
            <span className={styles.cardImg}>
              <img src={p.lookGarment || p.lookImage} alt="" draggable={false} className={styles.cutout} />
            </span>
            <span className={styles.cardName}>{p.name}</span>
            <span className={styles.cardPrice}>
              <Price price={p.price} />
            </span>
          </button>
        ))}
      </div>

      {n > 1 && (
        <>
          <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous look">
            <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => go(1)} aria-label="Next look">
            <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* progress dots down the left, like the reference */}
          <div className={styles.dots}>
            {list.map((p, i) => {
              const on = ((index % n) + n) % n === i;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={on ? styles.dotOn : ''}
                  onClick={() => {
                    const cur = ((index % n) + n) % n;
                    go(i - cur);
                  }}
                  aria-label={p.name}
                />
              );
            })}
          </div>
        </>
      )}

      {/* ---------- the bar ---------- */}
      {current && (
        <div className={styles.bar} key={`bar-${tab}-${current.id}`}>
          <Link to={`/product/${current.slug}`} className={styles.barItem}>
            <span className={styles.barThumb}>
              <img src={current.lookGarment || current.lookImage} alt="" className={styles.cutout} />
            </span>
            <span>
              <span className={styles.barName}>{current.name}</span>
              <span className={styles.barPrice}>
                <Price price={current.price} comparePrice={current.comparePrice} />
              </span>
            </span>
          </Link>

          {current.sizes?.length > 0 && (
            <div className={styles.group}>
              <span className={styles.groupLabel}>Size</span>
              <div className={styles.sizes}>
                {current.sizes.slice(0, 5).map((s) => (
                  <button key={s} type="button" className={size === s ? styles.sizeOn : ''} onClick={() => setSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {current.colors?.length > 0 && (
            <div className={styles.group}>
              <span className={styles.groupLabel}>{current.colors[color]?.name ?? 'Colour'}</span>
              <div className={styles.swatches}>
                {current.colors.slice(0, 4).map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    className={color === i ? styles.swatchOn : ''}
                    style={{ background: c.hex }}
                    onClick={() => setColor(i)}
                    aria-label={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          <button type="button" className={styles.add} onClick={addToBag}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 8h12l-1 12H7L6 8z" />
              <path d="M9 8V6a3 3 0 016 0v2" />
            </svg>
            Add to bag
          </button>
        </div>
      )}
    </section>
  );
}
