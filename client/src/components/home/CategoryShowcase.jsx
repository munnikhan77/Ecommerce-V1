import { Link } from 'react-router-dom';
import ProductImage from '../ui/ProductImage';
import Reveal from '../ui/Reveal';
import SectionHeading from '../ui/SectionHeading';
import styles from './CategoryShowcase.module.css';

// Editorial grid of categories — first tile is big, the rest fill around it
export default function CategoryShowcase({ categories }) {
  if (!categories.length) return null;

  return (
    <section className="section">
      <div className="container">
        <SectionHeading eyebrow="Shop by Category" title={<>Find your <em>kind</em> of comfort</>} />
        <div className={styles.grid}>
          {categories.slice(0, 5).map((c, i) => (
            <Reveal key={c.id} delay={i * 80} className={i === 0 ? styles.big : ''}>
              <Link to={`/shop?category=${c.slug}`} className={styles.tile}>
                <ProductImage src={c.image} tone={c.tone} alt={c.name} ratio={i === 0 ? 'auto' : '1 / 1'} />
                <div className={styles.caption}>
                  <p>{c.tagline}</p>
                  <h3>{c.name}</h3>
                  <span className={styles.count}>{c.productCount} pieces</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
