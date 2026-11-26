import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import RichText from '../ui/RichText';
import styles from './SocialCTA.module.css';

// Big quote-style banner pointing to Instagram
export default function SocialCTA({ settings, content }) {
  const instagram = settings?.social?.instagram;
  if (!instagram) return null;

  return (
    <section className={styles.cta}>
      <Reveal className="container">
        <p className="eyebrow">{content.eyebrow}</p>
        <h2>
          <RichText text={content.title} />
        </h2>
        <Button variant="outline" href={instagram}>
          @{settings.storeName.toLowerCase()} on Instagram
        </Button>
      </Reveal>
    </section>
  );
}
