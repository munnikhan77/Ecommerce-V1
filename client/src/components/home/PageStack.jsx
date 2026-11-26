import { Children, useEffect, useRef } from 'react';
import { scrollToY, setWheelHook } from '../../utils/smoothScroll';
import styles from './PageStack.module.css';

const PAGE_MS = 900;

/**
 * Homepage sections stacked like pages: each one slides up over the one before it,
 * which sinks back and darkens. A section taller than the screen scrolls through fully,
 * then stays pinned while the next one covers it.
 * With a mouse wheel, every flick turns exactly one page (or one screen of a tall page).
 *
 * Kept cheap so scrolling stays smooth: only transform + opacity change while scrolling,
 * written straight onto the two elements that need them (no inherited CSS variables, no filters).
 */
export default function PageStack({ children }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const layers = () => [...root.children];
    const parts = (layer) => ({ inner: layer.firstElementChild, shade: layer.lastElementChild });

    // pin point + zoom origin depend on each layer's height
    const measure = () =>
      layers().forEach((layer) => {
        const h = layer.offsetHeight;
        layer.style.top = `${Math.min(0, window.innerHeight - h)}px`;
        const origin = `50% ${h - window.innerHeight / 2}px`;
        parts(layer).inner.style.transformOrigin = origin;
        parts(layer).shade.style.transformOrigin = origin;
      });
    const resizeObserver = new ResizeObserver(() => {
      measure();
      update();
    });
    layers().forEach((layer) => resizeObserver.observe(layer));

    // how much of the screen the next layer covers → shrink + darken this one
    const lastCover = new WeakMap();
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const all = layers();
      // read every position first, then write — mixing the two forces a layout per layer
      const covers = all.map((_, i) =>
        all[i + 1] ? Math.round(Math.min(1, Math.max(0, 1 - all[i + 1].getBoundingClientRect().top / vh)) * 200) / 200 : 0
      );
      all.forEach((layer, i) => {
        const cover = covers[i];
        if (lastCover.get(layer) === cover) return;
        lastCover.set(layer, cover);
        const { inner, shade } = parts(layer);
        // the covered page shrinks into a rounded card and dims a little (shade moves with it)
        const transform = cover ? `scale(${1 - cover * 0.07})` : '';
        const radius = `${Math.round(cover * 28)}px`;
        inner.style.transform = transform;
        inner.style.borderRadius = radius;
        shade.style.transform = transform;
        shade.style.borderRadius = radius;
        shade.style.opacity = cover * 0.35;
      });
    };
    const onScroll = () => frame || (frame = requestAnimationFrame(update));
    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    // mouse wheel: one flick = one stop. Stops are the top of every page, plus one screen at a time
    // through pages taller than the screen. After the last stop the footer scrolls normally.
    const stops = () => {
      const vh = window.innerHeight;
      const headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 0;
      let start = root.getBoundingClientRect().top + window.scrollY;
      const list = [0];
      layers().forEach((layer, i) => {
        const h = layer.offsetHeight;
        // land each page just below the sticky header, not under it
        const first = i === 0 ? 0 : start - headerH;
        // a page only a little taller than the space under the header gets a single stop at its top
        // (its last few pixels pass by on the way to the next page); taller pages are walked through
        // one screen at a time and end where their bottom meets the screen's bottom
        const minStep = vh * 0.25;
        const fits = h - (vh - headerH) <= minStep;
        const end = fits ? first : start + h - vh;
        if (first > list[list.length - 1] + 2) list.push(first);
        for (let y = first + vh - headerH; y < end - minStep; y += vh - headerH) list.push(y);
        if (end > list[list.length - 1] + minStep) list.push(end);
        start += h;
      });
      return list;
    };

    // returns true when it took the flick (Lenis then ignores it).
    // One gesture = one page: a trackpad swipe (or a fast spin of the wheel) keeps sending
    // events for 1–3 s, so after a turn every event is swallowed until the wheel goes quiet.
    const QUIET_MS = 220;
    let busyUntil = 0;
    let lastEvent = 0;
    let gestureUsed = false;
    const onWheel = (deltaY) => {
      const now = Date.now();
      const newGesture = now - lastEvent > QUIET_MS;
      lastEvent = now;
      if (newGesture) gestureUsed = false;

      const dir = Math.sign(deltaY);
      if (!dir) return false;
      const list = stops();
      const y = window.scrollY;
      const last = list[list.length - 1];
      let target;
      if (dir > 0) {
        if (y >= last - 2 && now > busyUntil) return false; // past the pages → footer scrolls normally
        target = list.find((s) => s > y + 2);
      } else {
        if (y <= 0 || y > last + window.innerHeight) return false;
        target = [...list].reverse().find((s) => s < y - 2) ?? 0;
      }
      if (now < busyUntil || gestureUsed || target === undefined) return true;
      gestureUsed = true;
      busyUntil = now + PAGE_MS;
      scrollToY(target, { duration: PAGE_MS / 1000 });
      return true;
    };
    // page turning rides on the smooth-scroll engine, which only calls this for mouse/trackpad
    setWheelHook(onWheel);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      setWheelHook(null);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.stack}>
      {Children.toArray(children).map((child, i) => (
        // the Header watches #after-hero to know when to stop being see-through
        <div key={child.key ?? i} id={i === 1 ? 'after-hero' : undefined} className={styles.layer} style={{ zIndex: i + 1 }}>
          <div className={styles.inner}>{child}</div>
          <div className={styles.shade} aria-hidden="true" />
        </div>
      ))}
    </div>
  );
}
