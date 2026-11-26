import { useMemo } from 'react';
import styles from './Stars.module.css';

// small seeded random, so the same stars sit in the same places on every render
function seeded(seed) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

/** A field of twinkling stars, absolutely filling its (positioned) parent. */
export default function Stars({ count = 40, seed = 7, className = '' }) {
  const stars = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, () => ({
      left: rand() * 100,
      top: rand() * 100,
      size: 1 + rand() * 2.2,
      delay: rand() * -6,
      duration: 2.5 + rand() * 3.5,
    }));
  }, [count, seed]);

  return (
    <div className={`${styles.field} ${className}`} aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
