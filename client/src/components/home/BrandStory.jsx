import ProductImage from '../ui/ProductImage';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import styles from './BrandStory.module.css';

export default function BrandStory({ story }) {
  if (!story) return null;

  return (
    <section className={`section ${styles.story}`}>
      <div className={`container ${styles.grid}`}>
        <Reveal className={styles.media}>
          <ProductImage src={story.image} tone="#c7a397" ratio="4 / 5" alt="" />
          <span className={styles.stamp}>Est. 2026 · Kathmandu</span>
        </Reveal>
        <Reveal delay={150} className={styles.text}>
          <p className="eyebrow">{story.eyebrow}</p>
          <h2>{story.title}</h2>
          <p className={styles.body}>{story.body}</p>
          <Button variant="outline" to="/shop">
            Explore the collection
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
