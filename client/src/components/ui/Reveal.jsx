import { useInView } from '../../hooks/useInView';

// Wrap anything to make it fade up gently when it scrolls into view
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...props }) {
  const [ref, visible] = useInView();
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </Tag>
  );
}
