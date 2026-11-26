import { useEffect, useRef } from 'react';
import styles from './DuskSky.module.css';

/**
 * Scroll progress as a sunset: a thin line across the top of the screen that runs from
 * sunset orange to night blue, with a sun at its tip that turns into the moon as you
 * go down the page.
 */
export default function DuskSky() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty('--p', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
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
  }, []);

  return (
    <div ref={ref} className={styles.sky} aria-hidden="true">
      <span className={styles.line} />
      <span className={styles.orb}>
        <i className={styles.sun} />
        <i className={styles.moon} />
      </span>
    </div>
  );
}
