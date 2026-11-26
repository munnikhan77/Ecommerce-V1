import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice } from '../../utils/format';
import Icon from '../ui/Icon';
import { pauseScroll } from '../../utils/smoothScroll';
import ProductImage from '../ui/ProductImage';
import styles from './SearchOverlay.module.css';

const MAX_RESULTS = 6;

/** Full-width search panel under the header — shows matching products while you type */
export default function SearchOverlay({ open, onClose, categories = [] }) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const searchText = settings?.content.search;
  const input = useRef(null);
  const [term, setTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTerm('');
    setResults(null);
    const focus = setTimeout(() => input.current?.focus(), 80);
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    pauseScroll(true);
    return () => {
      clearTimeout(focus);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      pauseScroll(false);
    };
  }, [open, onClose]);

  // wait until typing pauses, then ask the API
  useEffect(() => {
    const q = term.trim();
    if (q.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .getProducts({ q })
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [term]);

  const showAll = (q = term.trim()) => {
    if (!q) return;
    onClose();
    navigate(`/shop?q=${encodeURIComponent(q)}`);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    showAll();
  };

  return (
    <div className={`${styles.root} ${open ? styles.open : ''}`} aria-hidden={!open} data-lenis-prevent>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.panel} role="dialog" aria-modal="true" aria-label="Search">
        <div className="container">
          <form className={styles.bar} onSubmit={onSubmit}>
            <Icon name="search" size={22} />
            <input
              ref={input}
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder={searchText?.placeholder}
              autoComplete="off"
              tabIndex={open ? 0 : -1}
            />
            {term && (
              <button type="button" className={styles.clear} onClick={() => setTerm('')} tabIndex={open ? 0 : -1}>
                Clear
              </button>
            )}
            <button type="button" className={styles.close} onClick={onClose} aria-label="Close search" tabIndex={open ? 0 : -1}>
              <Icon name="close" />
            </button>
          </form>

          <div className={styles.body}>
            {results === null ? (
              <Suggestions popular={searchText?.popular} categories={categories} onPick={(q) => setTerm(q)} onNavigate={onClose} />
            ) : results.length === 0 && !loading ? (
              <div className={styles.empty}>
                <p>
                  Nothing found for <em>“{term.trim()}”</em>
                </p>
                <span>Try a different word — or browse a category below.</span>
                <Suggestions popular={searchText?.popular} categories={categories} onPick={(q) => setTerm(q)} onNavigate={onClose} />
              </div>
            ) : (
              <div className={loading ? styles.fading : ''}>
                <div className={styles.resultsHead}>
                  <span className="eyebrow">
                    {results.length} {results.length === 1 ? 'piece' : 'pieces'} found
                  </span>
                  {results.length > 0 && (
                    <button type="button" className={styles.viewAll} onClick={() => showAll()}>
                      View all <Icon name="arrow" size={16} />
                    </button>
                  )}
                </div>
                <ul className={styles.results}>
                  {results.slice(0, MAX_RESULTS).map((p) => (
                    <li key={p.id}>
                      <Link to={`/product/${p.slug}`} onClick={onClose} className={styles.item}>
                        <ProductImage src={p.images?.[0]} tone={p.colors?.[0]?.hex} alt={p.name} />
                        <span className={styles.name}>{p.name}</span>
                        <span className={styles.price}>{formatPrice(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Suggestions({ popular = [], categories, onPick, onNavigate }) {
  return (
    <div className={styles.suggest}>
      {popular.length > 0 && (
        <div>
          <p className="eyebrow">Popular searches</p>
          <div className={styles.chips}>
            {popular.map((word) => (
              <button key={word} type="button" onClick={() => onPick(word)}>
                {word}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="eyebrow">Shop by category</p>
        <div className={styles.chips}>
          {categories.map((c) => (
            <Link key={c.id} to={`/shop?category=${c.slug}`} onClick={onNavigate}>
              {c.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
