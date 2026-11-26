import { useEffect, useRef } from 'react';
import styles from './DuskCursor.module.css';

const MAX_STARS = 14;
const STAR_GAP_PX = 22; // drop a star every this many pixels of movement

/**
 * The "saanjh" cursor: a small crescent moon at the pointer, a soft golden glow that
 * drifts after it, and tiny stars that fall off the trail and fade.
 * Over links and buttons the glow opens up. Mouse/trackpad only.
 */
export default function DuskCursor() {
  const moonRef = useRef(null);
  const glowRef = useRef(null);
  const trailRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const html = document.documentElement;
    html.classList.add('dusk-cursor');

    const moon = moonRef.current;
    const glow = glowRef.current;
    const trail = trailRef.current;
    const pos = { x: -100, y: -100 };
    const lag = { x: -100, y: -100 };
    let lastStar = { x: 0, y: 0 };
    let frame = 0;
    let shown = false;

    const loop = () => {
      // the glow eases toward the moon, so it trails a little behind
      lag.x += (pos.x - lag.x) * 0.16;
      lag.y += (pos.y - lag.y) * 0.16;
      moon.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
      glow.style.transform = `translate(${lag.x}px, ${lag.y}px)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    const dropStar = (x, y) => {
      if (trail.childElementCount >= MAX_STARS) trail.firstElementChild.remove();
      const star = document.createElement('span');
      star.className = styles.star;
      star.style.left = `${x}px`;
      star.style.top = `${y}px`;
      star.style.setProperty('--drift', `${(Math.random() - 0.5) * 30}px`);
      star.style.setProperty('--size', `${3 + Math.random() * 4}px`);
      star.addEventListener('animationend', () => star.remove());
      trail.appendChild(star);
    };

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!shown) {
        shown = true;
        lag.x = pos.x;
        lag.y = pos.y;
        html.classList.add('dusk-cursor-on');
      }
      if (Math.hypot(pos.x - lastStar.x, pos.y - lastStar.y) > STAR_GAP_PX) {
        lastStar = { ...pos };
        dropStar(pos.x, pos.y);
      }
    };
    // links, buttons and form controls open the glow up
    const onOver = (e) => {
      const hit = e.target.closest?.('a, button, [role="button"], [role="tab"], label, select, summary');
      glow.classList.toggle(styles.active, Boolean(hit));
    };
    const onDown = () => glow.classList.add(styles.pressed);
    const onUp = () => glow.classList.remove(styles.pressed);
    const onLeave = (e) => {
      if (!e.relatedTarget) {
        shown = false;
        html.classList.remove('dusk-cursor-on');
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    document.addEventListener('mouseout', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      html.classList.remove('dusk-cursor', 'dusk-cursor-on');
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.removeEventListener('mouseout', onLeave);
    };
  }, []);

  return (
    <div className={styles.root} aria-hidden="true">
      <div ref={trailRef} />
      <span ref={glowRef} className={styles.glow} />
      <span ref={moonRef} className={styles.moon} />
    </div>
  );
}
