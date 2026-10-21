import { useState } from 'react';
import styles from './ProductImage.module.css';

/**
 * Shows the product photo. If there is no photo yet (or it fails to load),
 * draws a soft satin-style placeholder in the product's colour so the
 * site still looks finished while you are shooting photos.
 */
export default function ProductImage({ src, alt = '', tone = '#e3cfc4', label, ratio = '3 / 4', className = '' }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div className={`${styles.frame} ${className}`} style={{ aspectRatio: ratio, '--tone': tone }}>
      {showImage ? (
        <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={styles.img} />
      ) : (
        <div className={styles.placeholder} role="img" aria-label={alt}>
          <span className={styles.sheen} />
          {label && <span className={styles.label}>{label}</span>}
        </div>
      )}
    </div>
  );
}
