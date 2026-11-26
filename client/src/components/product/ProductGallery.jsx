import { useRef, useState } from 'react';
import ProductImage from '../ui/ProductImage';
import Icon from '../ui/Icon';
import ImageLightbox from './ImageLightbox';
import styles from './ProductGallery.module.css';

const HOVER_ZOOM = 2.4;

export default function ProductGallery({ images, name, tone }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const mainRef = useRef(null);
  const list = images.length ? images : [''];
  const hasPhoto = Boolean(list[active]);

  // mouse over the photo → magnify the spot under the cursor
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || !hasPhoto) return;
    const box = mainRef.current.getBoundingClientRect();
    mainRef.current.style.setProperty('--zx', `${((e.clientX - box.left) / box.width) * 100}%`);
    mainRef.current.style.setProperty('--zy', `${((e.clientY - box.top) / box.height) * 100}%`);
  };

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
      <div
        ref={mainRef}
        className={`${styles.main} ${hasPhoto ? styles.zoomable : ''}`}
        style={{ '--zoom': HOVER_ZOOM }}
        onPointerMove={onMove}
        onClick={() => hasPhoto && setLightbox(true)}
        role={hasPhoto ? 'button' : undefined}
        tabIndex={hasPhoto ? 0 : undefined}
        onKeyDown={(e) => hasPhoto && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setLightbox(true))}
        aria-label={hasPhoto ? `Open ${name} photos full screen` : undefined}
      >
        <ProductImage key={active} src={list[active]} tone={tone} alt={name} label={hasPhoto ? null : name} ratio="4 / 5" />
        {hasPhoto && (
          <span className={styles.zoomHint}>
            <Icon name="plus" size={14} /> Zoom
          </span>
        )}
      </div>

      {lightbox && (
        <ImageLightbox images={images} index={active} onIndex={setActive} onClose={() => setLightbox(false)} name={name} />
      )}
    </div>
  );
}
