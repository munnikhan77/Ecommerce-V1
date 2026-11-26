/**
 * Smooth mouse-wheel scrolling for the shop (Lenis). Linux/Windows Chrome jumps ~100px per
 * wheel notch; Lenis eases between them so the whole site glides.
 * Only for mouse/trackpad — phones already scroll smoothly. Off for "reduce motion".
 */
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

let lenis = null;
let wheelHook = null;

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function startSmoothScroll() {
  if (lenis) return () => {};
  if (!window.matchMedia('(pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return () => {};
  }
  lenis = new Lenis({
    lerp: 0.1,
    wheelMultiplier: 1,
    // a page can claim a wheel flick (e.g. PageStack turning one page): then Lenis skips it
    // and the browser's own jump is cancelled too
    virtualScroll: ({ event, deltaY }) => {
      if (!wheelHook || event.type !== 'wheel' || !wheelHook(deltaY)) return true;
      if (event.cancelable) event.preventDefault();
      return false;
    },
  });
  let frame = requestAnimationFrame(function loop(time) {
    lenis?.raf(time);
    frame = requestAnimationFrame(loop);
  });
  return () => {
    cancelAnimationFrame(frame);
    lenis?.destroy();
    lenis = null;
  };
}

/** `fn(deltaY)` returns true when it handled the flick itself. Pass null to remove. */
export function setWheelHook(fn) {
  wheelHook = fn;
}

/** Glide (or jump) to a y position — goes through Lenis when it's running so the two never fight. */
export function scrollToY(y, { duration = 0.9, immediate = false } = {}) {
  if (lenis) {
    lenis.scrollTo(y, { duration, easing: ease, immediate, lock: !immediate, force: true });
  } else {
    window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' });
  }
}

/** Freeze page scrolling while a drawer / search panel is open. */
export function pauseScroll(paused) {
  if (!lenis) return;
  if (paused) lenis.stop();
  else lenis.start();
}
