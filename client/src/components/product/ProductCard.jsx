import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { discountPercent } from '../../utils/format';
import Price from '../ui/Price';
import ProductImage from '../ui/ProductImage';
import Reveal from '../ui/Reveal';
import styles from './ProductCard.module.css';

export default function ProductCard({ product, index = 0, rank = null }) {
  const { id, slug, name, price, comparePrice, images, colors, sizes = [], isNew, stock } = product;
  const { addItem } = useCart();
  const tone = colors[0]?.hex;
  const off = discountPercent(price, comparePrice);
  const href = `/product/${slug}`;

  // quick add skips the product page — first colour, chosen size
  const quickAdd = (size = '') =>
    addItem({
      productId: id,
      slug,
      name,
      price,
      image: images[0] ?? '',
      tone,
      size,
      color: colors[0]?.name ?? '',
      quantity: 1,
    });

  return (
    <Reveal delay={(index % 4) * 90} className={rank ? styles.ranked : ''}>
      <div className={styles.card}>
        <div className={styles.media}>
          <Link to={href} aria-label={name}>
            <ProductImage src={images[0]} tone={tone} alt={name} label={images[0] ? null : name} />
            {/* second photo fades in on hover */}
            {images[1] && (
              <div className={styles.hoverImg}>
                <ProductImage src={images[1]} tone={tone} alt="" />
              </div>
            )}
          </Link>
          <div className={styles.badges}>
            {stock === 0 && <span className={styles.badge}>Sold out</span>}
            {stock > 0 && isNew && <span className={styles.badge}>New</span>}
            {stock > 0 && off > 0 && <span className={`${styles.badge} ${styles.sale}`}>−{off}%</span>}
          </div>

          {stock > 0 && (
            <div className={styles.quick}>
              {sizes.length > 1 ? (
                <>
                  <span className={styles.quickLabel}>Quick add</span>
                  <div className={styles.quickSizes}>
                    {sizes.map((s) => (
                      <button key={s} type="button" onClick={() => quickAdd(s)} aria-label={`Add ${name}, size ${s}, to bag`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button type="button" className={styles.quickOne} onClick={() => quickAdd(sizes[0] ?? '')}>
                  Add to Bag
                </button>
              )}
            </div>
          )}
        </div>

        <Link to={href} className={styles.info}>
          <h3 className={styles.name}>{name}</h3>
          <Price price={price} comparePrice={comparePrice} />
          {colors.length > 1 && (
            <div className={styles.swatches} aria-label={`${colors.length} colours`}>
              {colors.map((c) => (
                <span key={c.name} title={c.name} style={{ background: c.hex }} />
              ))}
            </div>
          )}
        </Link>
      </div>
      {rank && <span className={styles.rank}>{String(rank).padStart(2, '0')}</span>}
    </Reveal>
  );
}
