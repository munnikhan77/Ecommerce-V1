import { useState } from 'react';
import ProductImage from '../ui/ProductImage';
import styles from './ProductGallery.module.css';

export default function ProductGallery({ images, name, tone }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [''];

  return (
    <div className={styles.gallery}>
      {list.length > 1 && (
        <div className={styles.thumbs}>
          {list.map((src, i) => (
            <button
              key={src + i}
              className={i === active ? styles.activeThumb : ''}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
            >
              <ProductImage src={src} tone={tone} alt="" />
            </button>
          ))}
        </div>
      )}
      <div className={styles.main}>
        <ProductImage key={active} src={list[active]} tone={tone} alt={name} label={list[active] ? null : name} ratio="4 / 5" />
      </div>
    </div>
  );
}
