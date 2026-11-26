import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../ui/ProductImage';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import RichText from '../ui/RichText';
import { GENDERS, categoriesFor } from '../../utils/gender';
import styles from './CategoryShowcase.module.css';

// Editorial grid of categories — first tile is big, the rest fill around it.
// A category with a cut-out model (PNG, no background) gets the "pop-out" look:
// the model stands in the card and her head/shoulders step out over the top edge.
export default function CategoryShowcase({ categories, content }) {
  const gridRef = useRef(null);
  const [gender, setGender] = useState('women');

  // touch screens have no hover: lift each tile's model while that tile is in the middle of the screen
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !window.matchMedia('(hover: none)').matches) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle(styles.lifted, e.isIntersecting)),
      { rootMargin: '-30% 0px -30% 0px' } // = the middle 40% of the screen
    );
    grid.querySelectorAll(`.${styles.tile}`).forEach((tile) => observer.observe(tile));
    return () => observer.disconnect();
  }, [categories, gender]);

  if (!categories.length) return null;
  // only offer the switch when both halves of the store have categories
  const hasBoth = GENDERS.every((g) => categoriesFor(categories, g.key).length > 0);
  const shown = categoriesFor(categories, hasBoth ? gender : null).slice(0, 5);
  const path = GENDERS.find((g) => g.key === gender)?.path ?? '/shop';
  const hasPop = shown.some((c) => c.cutout);

  return (
    <section className="section">
      <div className="container">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={<RichText text={content.title} />}
          action={
            hasBoth && (
              <div className={styles.switch} role="tablist" aria-label="Women or men">
                {GENDERS.map((g) => (
                  <button
                    key={g.key}
                    role="tab"
                    aria-selected={gender === g.key}
                    className={gender === g.key ? styles.switchOn : ''}
                    onClick={() => setGender(g.key)}
                  >
                    {g.label}
                  </button>
                ))}
                <span className={styles.switchPill} style={{ '--x': gender === 'men' ? 1 : 0 }} />
              </div>
            )
          }
        />
        {/* keyed by gender so the tiles fade in again when you switch */}
        <div key={gender} ref={gridRef} className={`${styles.grid} ${hasPop ? styles.popGrid : ''}`}>
          {shown.map((c, i) => {
            // with only four tiles the last one stretches across, so the grid has no hole
            const wide = shown.length === 4 && i === 3;
            return (
              <Reveal key={c.id} delay={i * 80} className={i === 0 ? styles.big : wide ? styles.wide : ''}>
                <Link to={`${hasBoth ? path : '/shop'}?category=${c.slug}`} className={`${styles.tile} ${c.cutout ? styles.pop : ''}`}>
                  <ProductImage src={c.image} tone={c.tone} alt={c.name} ratio={i === 0 ? 'auto' : wide ? '2 / 1' : '1 / 1'} />
                  {c.cutout && <img src={c.cutout} alt="" className={styles.figure} loading="lazy" />}
                  <div className={styles.caption}>
                    <p>{c.tagline}</p>
                    <h3>{c.name}</h3>
                    <span className={styles.count}>{c.productCount} pieces</span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
