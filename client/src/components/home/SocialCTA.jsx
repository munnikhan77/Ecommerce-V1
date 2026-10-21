import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import styles from './SocialCTA.module.css';

// Big quote-style banner pointing to Instagram
export default function SocialCTA({ settings }) {
  const instagram = settings?.social?.instagram;
  if (!instagram) return null;

  return (
    <section className={styles.cta}>
      <Reveal className="container">
        <p className="eyebrow">Follow along</p>
        <h2>
          Bedtime stories, <em>new drops</em>
          <br />& real customers in our pieces.
        </h2>
        <Button variant="outline" href={instagram}>
          @{settings.storeName.toLowerCase()} on Instagram
        </Button>
      </Reveal>
    </section>
  );
}
