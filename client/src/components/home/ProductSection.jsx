import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import ProductGrid from '../product/ProductGrid';
import Button from '../ui/Button';
import SectionHeading from '../ui/SectionHeading';
import { GENDERS } from '../../utils/gender';
import styles from './ProductSection.module.css';

/**
 * A titled row of products loaded from the API.
 *   <ProductSection title="Bestsellers" query={{ featured: true, limit: 4 }} />
 * `ranked` numbers the cards 01, 02… and opens each photo like a curtain.
 * `split` shows Women and Men side by side, `perSide` products each.
 */
export default function ProductSection({ eyebrow, title, query, link = '/shop', tinted = false, ranked = false, split = false, perSide = 2 }) {
  // split: one list per gender; otherwise a single list
  const { data, loading } = useFetch(
    () =>
      split
        ? Promise.all(GENDERS.map((g) => api.getProducts({ ...query, gender: g.key, limit: perSide })))
        : api.getProducts(query),
    [JSON.stringify(query), split, perSide]
  );
  const sectionRef = useRef(null);

  // ranked sections drift with the scroll: --p goes 0 → 1 while the section passes through the screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!ranked || !el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = el.getBoundingClientRect();
      const progress = (window.innerHeight - top) / (window.innerHeight + height);
      el.style.setProperty('--p', Math.min(1, Math.max(0, progress)).toFixed(3));
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
  }, [ranked]);

  return (
    <section ref={sectionRef} className="section" style={tinted ? { background: 'var(--bg-soft)' } : undefined}>
      <div className="container">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          action={
            <Button variant="text" to={link}>
              View all
            </Button>
          }
        />
        {split ? (
          <div className={styles.split}>
            {GENDERS.map((g, i) => (
              <div key={g.key} className={styles.side}>
                <Link to={g.path} className={styles.sideHead}>
                  <span className={styles.sideIndex}>{i ? 'His' : 'Her'} picks</span>
                  <span className={styles.sideLabel}>{g.label}</span>
                </Link>
                <ProductGrid products={data?.[i]} loading={loading} columns={perSide} ranked={ranked} className={styles.sideGrid} />
              </div>
            ))}
            <span className={styles.divider} aria-hidden="true" />
          </div>
        ) : (
          <ProductGrid products={data} loading={loading} ranked={ranked} />
        )}
      </div>
    </section>
  );
}
