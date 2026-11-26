import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useInView } from '../../hooks/useInView';
import Price from '../ui/Price';
import ProductImage from '../ui/ProductImage';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import RichText from '../ui/RichText';
import { GENDERS } from '../../utils/gender';
import styles from './NewArrivals.module.css';

const AUTO_MS = 3800;

const PER_GENDER = 5;

/**
 * Newest pieces as a 3D cover-flow: the centre card faces you, the others swing back
 * on either side. Women's and men's pieces alternate in the ring, each tagged; the
 * All / Women / Men chips narrow it down. Turns by itself (pauses on hover), or with
 * arrows, dots, a swipe or a click.
 */
export default function NewArrivals({ content }) {
  const { data: lists } = useFetch(
    () => Promise.all(GENDERS.map((g) => api.getProducts({ sort: 'newest', gender: g.key, limit: PER_GENDER }))),
    []
  );
  const [filter, setFilter] = useState('all');
  if (!lists) return null;

  // tag each piece with who it's for, then alternate women / men
  const tagged = GENDERS.map((g, i) => lists[i].map((p) => ({ ...p, gender: g })));
  const mixed = [];
  for (let i = 0; i < PER_GENDER; i++) tagged.forEach((list) => list[i] && mixed.push(list[i]));
  const products = filter === 'all' ? mixed : mixed.filter((p) => p.gender.key === filter);
  if (!mixed.length) return null;

  return <CoverFlow key={filter} products={products} content={content} filter={filter} onFilter={setFilter} />;
}

// split out so the in-view observer attaches only once the section really exists
function CoverFlow({ products, content, filter, onFilter }) {
  const [sectionRef, visible] = useInView({ threshold: 0.2 });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef(null);
  const dragged = useRef(false);
  const count = products.length;

  const go = (i) => setActive(((i % count) + count) % count);

  useEffect(() => {
    if (!visible || paused || count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setTimeout(() => setActive((i) => (i + 1) % count), AUTO_MS);
    return () => clearTimeout(timer);
  }, [visible, paused, active, count]);

  const onPointerDown = (e) => (drag.current = e.clientX);
  const onPointerUp = (e) => {
    if (drag.current === null) return;
    const dx = e.clientX - drag.current;
    drag.current = null;
    if (Math.abs(dx) > 40) {
      dragged.current = true; // so the click that ends a swipe doesn't open a product
      go(active + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <section ref={sectionRef} className={`section ${styles.section} ${visible ? styles.visible : ''}`}>
      {/* giant outlined words drifting behind the cards */}
      <div className={styles.marquee} aria-hidden="true">
        {[0, 1].map((n) => (
          <span key={n}>{`${content.marquee} ✦ `.repeat(2)}&nbsp;</span>
        ))}
      </div>

      <div className={`container ${styles.head}`}>
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h2>
            <RichText text={content.title} />
          </h2>
        </div>
        <div className={styles.headRight}>
          <div className={styles.chips} role="tablist" aria-label="Show new pieces for">
            {[{ key: 'all', label: 'All' }, ...GENDERS].map((g) => (
              <button key={g.key} role="tab" aria-selected={filter === g.key} className={filter === g.key ? styles.chipOn : ''} onClick={() => onFilter(g.key)}>
                {g.label}
              </button>
            ))}
          </div>
          <Button variant="text" to={filter === 'all' ? '/shop?sort=newest' : `${GENDERS.find((g) => g.key === filter).path}?sort=newest`}>
            View all
          </Button>
        </div>
      </div>

      <div
        className={styles.stage}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (drag.current = null)}
      >
        {products.map((p, i) => {
          // shortest way round, so the ring wraps: …, -2, -1, 0, 1, 2, …
          let offset = i - active;
          if (offset > count / 2) offset -= count;
          if (offset < -count / 2) offset += count;
          const depth = Math.abs(offset);
          const isActive = offset === 0;
          return (
            <article
              key={p.id}
              className={`${styles.card} ${isActive ? styles.current : ''}`}
              style={{
                '--offset': offset,
                '--depth': depth,
                zIndex: 20 - depth,
                opacity: depth > 2 ? 0 : 1,
                pointerEvents: depth > 2 ? 'none' : undefined,
              }}
            >
              <Link
                to={`/product/${p.slug}`}
                draggable={false}
                onClick={(e) => {
                  if (dragged.current) {
                    dragged.current = false;
                    e.preventDefault();
                    return;
                  }
                  // side cards come to the front first; the front card opens the product
                  if (!isActive) {
                    e.preventDefault();
                    go(i);
                  }
                }}
                aria-label={p.name}
              >
                <div className={styles.media}>
                  <ProductImage src={p.images[0]} tone={p.colors[0]?.hex} alt={p.name} />
                  <span className={styles.shine} />
                  {p.isNew && <span className={styles.badge}>New</span>}
                  <span className={`${styles.tag} ${p.gender.key === 'men' ? styles.tagMen : ''}`}>{p.gender.label}</span>
                </div>
                <div className={styles.info}>
                  <h3>{p.name}</h3>
                  <Price price={p.price} comparePrice={p.comparePrice} />
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      <div className={styles.controls}>
        <button onClick={() => go(active - 1)} aria-label="Previous">
          <Icon name="arrowLeft" />
        </button>
        <div className={styles.dots}>
          {products.map((p, i) => (
            <button key={p.id} onClick={() => go(i)} className={i === active ? styles.dotOn : ''} aria-label={`Show ${p.name}`} />
          ))}
        </div>
        <button onClick={() => go(active + 1)} aria-label="Next">
          <Icon name="arrow" />
        </button>
      </div>
    </section>
  );
}
