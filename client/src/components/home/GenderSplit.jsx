import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useInView } from '../../hooks/useInView';
import { GENDERS } from '../../utils/gender';
import ProductImage from '../ui/ProductImage';
import Icon from '../ui/Icon';
import styles from './GenderSplit.module.css';

const OPEN_MS = 750; // how long the chosen side takes to fill the screen before we navigate
const BREATHE_MS = 3200; // phones: how often the "look at me" highlight swaps sides

/**
 * Full-screen "who are you shopping for?" page: Women on one side, Men on the other.
 * Desktop: the side under the mouse widens. Phones (no hover): the two halves take turns
 * gently growing. Choosing a side makes it fill the screen, then opens that shop.
 * Labels, subtitles and photos come from /admin/settings → Homepage sections.
 */
export default function GenderSplit({ content }) {
  const [ref, visible] = useInView({ threshold: 0.3 });
  const navigate = useNavigate();
  const [chosen, setChosen] = useState('');
  const [breathing, setBreathing] = useState('');

  // phones only: alternate a soft highlight so the page invites a tap
  useEffect(() => {
    if (!visible || chosen || !window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let i = 0;
    const first = setTimeout(() => setBreathing(GENDERS[0].key), 1400);
    const timer = setInterval(() => setBreathing(GENDERS[++i % GENDERS.length].key), BREATHE_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [visible, chosen]);

  const choose = (e, g) => {
    // keep ctrl/cmd-click (new tab) working normally
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (chosen) return;
    setChosen(g.key);
    setTimeout(() => navigate(g.path), OPEN_MS);
  };

  const state = chosen ? styles.choosing : breathing ? styles.breathing : '';

  return (
    <section ref={ref} className={`${styles.split} ${visible ? styles.visible : ''} ${state}`} data-lit={chosen ? '' : breathing}>
      {GENDERS.map((g, i) => {
        const side = content[g.key];
        const cls = [styles.side, chosen === g.key && styles.chosen, !chosen && breathing === g.key && styles.lit].filter(Boolean).join(' ');
        return (
          <Link key={g.key} to={g.path} onClick={(e) => choose(e, g)} className={cls} style={{ '--i': i }}>
            <div className={styles.media}>
              <ProductImage src={side.image} tone={i ? '#3b3f4a' : '#8a6b60'} alt="" ratio="auto" />
            </div>
            <span className={styles.shade} />
            <div className={styles.text}>
              <span className={styles.index}>{String(i + 1).padStart(2, '0')}</span>
              <h2 className={styles.label}>{side.label}</h2>
              <p className={styles.subtitle}>{side.subtitle}</p>
              <span className={styles.cta}>
                Shop {side.label.toLowerCase()} <Icon name="arrow" size={16} />
              </span>
            </div>
          </Link>
        );
      })}
      <span className={styles.divider} aria-hidden="true">
        <i>or</i>
      </span>
    </section>
  );
}
