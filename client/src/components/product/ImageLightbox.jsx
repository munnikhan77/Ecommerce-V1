import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { pauseScroll } from '../../utils/smoothScroll';
import Icon from '../ui/Icon';
import styles from './ImageLightbox.module.css';

const MAX_SCALE = 4;
const TAP_ZOOM = 2.5;

/**
 * Full-screen photo viewer with real zoom:
 *  - mouse: click to zoom where you clicked, wheel to zoom in/out, drag to look around
 *  - touch: pinch, double-tap, drag; swipe left/right (when not zoomed) for the next photo
 *  - keys: ← → to change photo, Esc to close
 */
export default function ImageLightbox({ images, index, onIndex, onClose, name }) {
  const frameRef = useRef(null);
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const viewRef = useRef(view);
  viewRef.current = view;
  const pointers = useRef(new Map());
  const gesture = useRef(null);
  const lastTap = useRef(0);
  const [dragging, setDragging] = useState(false); // no easing while a finger/mouse is moving it
  const count = images.length;

  const go = useCallback((i) => {
    onIndex(((i % count) + count) % count);
    setView({ s: 1, x: 0, y: 0 });
  }, [count, onIndex]);

  // keep the photo from being dragged off screen
  const clamp = (v) => {
    const box = frameRef.current?.getBoundingClientRect();
    if (!box || v.s <= 1) return { s: 1, x: 0, y: 0 };
    const maxX = (box.width * (v.s - 1)) / 2;
    const maxY = (box.height * (v.s - 1)) / 2;
    return { s: v.s, x: Math.max(-maxX, Math.min(maxX, v.x)), y: Math.max(-maxY, Math.min(maxY, v.y)) };
  };

  // zoom to scale `s2`, keeping the screen point (cx, cy) fixed under the finger/cursor
  const zoomAt = (s2, cx, cy, from = viewRef.current) => {
    const box = frameRef.current.getBoundingClientRect();
    const px = cx - (box.left + box.width / 2);
    const py = cy - (box.top + box.height / 2);
    const s = Math.max(1, Math.min(MAX_SCALE, s2));
    const k = s / from.s;
    return clamp({ s, x: px - (px - from.x) * k, y: py - (py - from.y) * k });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    pauseScroll(true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      pauseScroll(false);
    };
  }, [index, go, onClose]);

  // wheel zoom (needs a non-passive listener to stop the page from scrolling)
  useEffect(() => {
    const frame = frameRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      setView((v) => zoomAt(v.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY, v));
    };
    frame.addEventListener('wheel', onWheel, { passive: false });
    return () => frame.removeEventListener('wheel', onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointerDown = (e) => {
    try {
      frameRef.current.setPointerCapture(e.pointerId); // keep getting moves even outside the frame
    } catch {
      /* pointer already gone — the gesture still works without capture */
    }
    setDragging(true);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const v = viewRef.current;
    if (pts.length === 2) {
      const [a, b] = pts;
      gesture.current = { type: 'pinch', dist: Math.hypot(a.x - b.x, a.y - b.y), start: v };
    } else {
      gesture.current = { type: 'pan', sx: e.clientX, sy: e.clientY, start: v, t: Date.now(), moved: false };
    }
  };

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.type === 'pinch') {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      setView(zoomAt(g.start.s * (dist / g.dist), (a.x + b.x) / 2, (a.y + b.y) / 2, g.start));
    } else {
      const dx = e.clientX - g.sx;
      const dy = e.clientY - g.sy;
      if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;
      if (g.start.s > 1) setView(clamp({ s: g.start.s, x: g.start.x + dx, y: g.start.y + dy }));
    }
  };

  const onPointerUp = (e) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) {
      // one finger left after a pinch → carry on panning from here
      const [p] = [...pointers.current.values()];
      gesture.current = { type: 'pan', sx: p.x, sy: p.y, start: viewRef.current, t: 0, moved: true };
      return;
    }
    gesture.current = null;
    setDragging(false);
    if (!g || g.type !== 'pan') return;

    const dx = e.clientX - g.sx;
    // swipe to the next photo when not zoomed in
    if (g.start.s === 1 && Math.abs(dx) > 60 && count > 1) return go(index + (dx < 0 ? 1 : -1));
    if (g.moved) return;

    // tap: mouse = single click toggles, touch = double-tap toggles
    const now = Date.now();
    const isDouble = now - lastTap.current < 300;
    lastTap.current = now;
    if (e.pointerType === 'mouse' || isDouble) {
      setView((v) => (v.s > 1 ? { s: 1, x: 0, y: 0 } : zoomAt(TAP_ZOOM, e.clientX, e.clientY, v)));
    }
  };

  const zoomed = view.s > 1;

  // rendered into <body> so no sticky/transformed parent can trap it under the header
  return createPortal(
    <div className={styles.root} role="dialog" aria-modal="true" aria-label={`${name} photos`} data-lenis-prevent>
      <div className={styles.top}>
        <span className={styles.counter}>
          {index + 1} / {count}
        </span>
        <div className={styles.tools}>
          <button onClick={() => setView((v) => zoomAt(v.s / 1.5, innerWidth / 2, innerHeight / 2, v))} disabled={!zoomed} aria-label="Zoom out">
            <Icon name="minus" />
          </button>
          <button onClick={() => setView((v) => zoomAt(v.s * 1.5, innerWidth / 2, innerHeight / 2, v))} disabled={view.s >= MAX_SCALE} aria-label="Zoom in">
            <Icon name="plus" />
          </button>
          <button onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>
      </div>

      <div
        ref={frameRef}
        className={`${styles.frame} ${zoomed ? styles.zoomed : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={(e) => {
          pointers.current.delete(e.pointerId);
          gesture.current = null;
          setDragging(false);
        }}
        onDoubleClick={(e) => e.preventDefault()}
      >
        <img
          key={index}
          src={images[index]}
          alt={`${name} — photo ${index + 1}`}
          draggable={false}
          className={dragging ? styles.live : ''}
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})` }}
        />
      </div>

      {count > 1 && (
        <>
          <button className={`${styles.nav} ${styles.prev}`} onClick={() => go(index - 1)} aria-label="Previous photo">
            <Icon name="arrowLeft" />
          </button>
          <button className={`${styles.nav} ${styles.next}`} onClick={() => go(index + 1)} aria-label="Next photo">
            <Icon name="arrow" />
          </button>
          <div className={styles.thumbs}>
            {images.map((src, i) => (
              <button key={src + i} onClick={() => go(i)} className={i === index ? styles.thumbOn : ''} aria-label={`Photo ${i + 1}`}>
                <img src={src} alt="" draggable={false} />
              </button>
            ))}
          </div>
        </>
      )}

      <p className={styles.hint}>{zoomed ? 'Drag to look around' : 'Click, scroll or pinch to zoom'}</p>
    </div>,
    document.body
  );
}
