import { useEffect, useState } from 'react';
import { toLines } from '../../utils/format';
import Button from '../ui/Button';
import styles from './Hero.module.css';

const SLIDE_MS = 7000;

/** Full-screen hero. Slides come from settings.heroSlides (edit them in /admin/settings). */
export default function Hero({ slides = [] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setActive((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => clearInterval(timer);
  }, [slides.length, active]);

  if (!slides.length) return null;

  return (
    <section className={styles.hero}>
      {slides.map((slide, i) => (
        <div key={slide.id} className={`${styles.slide} ${i === active ? styles.active : ''}`} style={{ '--tone': slide.tone }}>
          <HeroMedia slide={slide} />
          <div className={styles.overlay} />

          <div className={`container ${styles.content}`}>
            <p className={`eyebrow ${styles.eyebrow}`}>{slide.eyebrow}</p>
            <h1 className={styles.title}>
              {toLines(slide.title).map((line, n) => (
                <span key={n} style={{ transitionDelay: `${200 + n * 120}ms` }}>
                  {line}
                </span>
              ))}
            </h1>
            <p className={styles.subtitle}>{slide.subtitle}</p>
            {slide.ctaText && (
              <Button variant="light" to={slide.ctaLink} className={styles.cta}>
                {slide.ctaText}
              </Button>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className={styles.dots}>
          {slides.map((s, i) => (
            <button key={s.id} onClick={() => setActive(i)} className={i === active ? styles.dotActive : ''} aria-label={`Slide ${i + 1}`}>
              <span />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// Video > image > soft gradient fallback
function HeroMedia({ slide }) {
  if (slide.video) {
    return <video className={styles.media} src={slide.video} poster={slide.image || undefined} autoPlay muted loop playsInline />;
  }
  if (slide.image) return <img className={styles.media} src={slide.image} alt="" />;
  return <div className={`${styles.media} ${styles.gradient}`} />;
}
