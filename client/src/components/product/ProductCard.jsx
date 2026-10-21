import { Link } from 'react-router-dom';
import { discountPercent } from '../../utils/format';
import Price from '../ui/Price';
import ProductImage from '../ui/ProductImage';
import Reveal from '../ui/Reveal';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, index = 0 }) {
  const { slug, name, price, comparePrice, images, colors, isNew, stock } = product;
  const tone = colors[0]?.hex;
  const off = discountPercent(price, comparePrice);

  return (
    <Reveal delay={(index % 4) * 90}>
      <Link to={`/product/${slug}`} className={styles.card}>
        <div className={styles.media}>
          <ProductImage src={images[0]} tone={tone} alt={name} label={images[0] ? null : name} />
          {/* second photo fades in on hover */}
          {images[1] && (
            <div className={styles.hoverImg}>
              <ProductImage src={images[1]} tone={tone} alt="" />
            </div>
          )}
          <div className={styles.badges}>
            {stock === 0 && <span className={styles.badge}>Sold out</span>}
            {stock > 0 && isNew && <span className={styles.badge}>New</span>}
            {stock > 0 && off > 0 && <span className={`${styles.badge} ${styles.sale}`}>−{off}%</span>}
          </div>
          <span className={styles.view}>View Product</span>
        </div>

        <div className={styles.info}>
          <h3 className={styles.name}>{name}</h3>
          <Price price={price} comparePrice={comparePrice} />
          {colors.length > 1 && (
            <div className={styles.swatches} aria-label={`${colors.length} colours`}>
              {colors.map((c) => (
                <span key={c.name} title={c.name} style={{ background: c.hex }} />
              ))}
            </div>
          )}
        </div>
      </Link>
    </Reveal>
  );
}
