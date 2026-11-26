import { useEffect, useRef, useState } from 'react';
import { scrollToY } from '../../utils/smoothScroll';
import Icon from '../ui/Icon';
import styles from './ScrollButtons.module.css';

const RING = 2 * Math.PI * 21; // circumference of the progress ring (r = 21)

/**
 * Two small round buttons in the corner: ↑ back to the top (its ring fills with the
 * dusk colours as you read down the page) and ↓ straight to the bottom.
 */
export default function ScrollButtons() {
  const ringRef = useRef(null);
  const [show, setShow] = useState({ up: false, down: true });

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const progress = max > 0 ? y / max : 0;
      ringRef.current?.style.setProperty('stroke-dashoffset', (RING * (1 - progress)).toFixed(1));
      const up = y > 400;
      const down = max - y > 400;
      setShow((s) => (s.up === up && s.down === down ? s : { up, down }));
    };
    const onScroll = () => frame || (frame = requestAnimationFrame(update));
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    // the page grows as products load in — re-check when its height changes
    const resizeObserver = new ResizeObserver(onScroll);
    resizeObserver.observe(document.body);
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const toBottom = () => scrollToY(document.documentElement.scrollHeight - window.innerHeight, { duration: 1.4 });

  return (
    <div className={styles.wrap}>
      <button className={`${styles.btn} ${show.up ? styles.on : ''}`} onClick={() => scrollToY(0, { duration: 1.4 })} aria-label="Back to top" tabIndex={show.up ? 0 : -1}>
        <svg className={styles.ring} viewBox="0 0 48 48" aria-hidden="true">
          <defs>
            <linearGradient id="dusk-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e2bf9c" />
              <stop offset="0.5" stopColor="#c49a85" />
              <stop offset="1" stopColor="#8a6253" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="24" r="21" className={styles.track} />
          <circle ref={ringRef} cx="24" cy="24" r="21" className={styles.progress} strokeDasharray={RING} strokeDashoffset={RING} />
        </svg>
        <Icon name="arrow" size={16} className={styles.up} />
      </button>
      <button className={`${styles.btn} ${show.down ? styles.on : ''}`} onClick={toBottom} aria-label="Go to bottom" tabIndex={show.down ? 0 : -1}>
        <Icon name="arrow" size={16} className={styles.down} />
      </button>
    </div>
  );
}
