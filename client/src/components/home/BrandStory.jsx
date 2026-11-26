import { Fragment } from 'react';
import { useInView } from '../../hooks/useInView';
import Button from '../ui/Button';
import styles from './BrandStory.module.css';

const WORD_MS = 130; // delay between words lighting up

/**
 * "Our story" as a typographic moment: a big centred title whose words go from faint to
 * ink one by one, with small round photos (story.pills) blooming open between them.
 * The last word is the coloured italic accent. Body text and the brand promises
 * (story.values) follow underneath. Everything is edited in /admin/settings.
 */
export default function BrandStory({ story }) {
  const [ref, visible] = useInView({ threshold: 0.3 });
  if (!story) return null;

  const words = story.title.trim().split(/\s+/);
  const pills = (story.pills ?? []).filter(Boolean);
  // spread the photos through the title: after the first word, then about two-thirds in
  const slots = pills.length ? [0, Math.max(1, Math.round(words.length * 0.6) - 1)].slice(0, pills.length) : [];
  const values = (story.values ?? []).filter((v) => v.title || v.text);

  let step = 0; // running order of words + photos, for the stagger
  return (
    <section ref={ref} className={`section ${styles.story} ${visible ? styles.visible : ''}`}>
      <div className={`container ${styles.inner}`}>
        <p className={`eyebrow ${styles.eyebrow}`}>{story.eyebrow}</p>

        <h2 className={styles.title} aria-label={story.title}>
          {words.map((word, i) => {
            const last = i === words.length - 1;
            const wordDelay = 200 + step++ * WORD_MS;
            const pillIndex = slots.indexOf(i);
            const pillDelay = pillIndex >= 0 ? 200 + step++ * WORD_MS : 0;
            return (
              <Fragment key={i}>
                <span className={`${styles.word} ${last ? styles.accent : ''}`} style={{ transitionDelay: `${wordDelay}ms` }} aria-hidden="true">
                  {word}
                </span>{' '}
                {pillIndex >= 0 && (
                  <>
                    <span className={styles.pill} style={{ transitionDelay: `${pillDelay}ms` }} aria-hidden="true">
                      <img src={pills[pillIndex]} alt="" loading="lazy" />
                    </span>{' '}
                  </>
                )}
              </Fragment>
            );
          })}
        </h2>

        <p className={styles.body}>{story.body}</p>

        {values.length > 0 && (
          <ol className={styles.values}>
            {values.map((v, i) => (
              <li key={i} style={{ transitionDelay: `${1300 + i * 140}ms` }}>
                <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <strong>{v.title}</strong>
                  <p>{v.text}</p>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className={styles.cta}>
          <Button variant="outline" to="/shop">
            Explore the collection
          </Button>
        </div>
      </div>
    </section>
  );
}
