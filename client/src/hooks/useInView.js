import { useEffect, useRef, useState } from 'react';

// Returns [ref, isVisible] — becomes true once the element scrolls into view
export function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return [ref, visible];
}
