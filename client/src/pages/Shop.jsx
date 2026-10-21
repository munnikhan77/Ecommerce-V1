import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { useSettings } from '../context/SettingsContext';
import ProductGrid from '../components/product/ProductGrid';
import styles from './Shop.module.css';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { categories } = useSettings();
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'featured';
  const q = params.get('q') ?? '';

  const { data: products, loading } = useFetch(() => api.getProducts({ category, sort, q }), [category, sort, q]);

  const current = categories.find((c) => c.slug === category);
  const title = q ? `“${q}”` : current?.name ?? 'Shop All';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next);
  };

  return (
    <div className={styles.page}>
      <header className={`container ${styles.head}`}>
        <p className="eyebrow">{q ? 'Search results' : current?.tagline ?? 'The full collection'}</p>
        <h1>{title}</h1>
      </header>

      <div className={styles.toolbar}>
        <div className={`container ${styles.toolbarInner}`}>
          <nav className={styles.tabs} aria-label="Categories">
            <Link to="/shop" className={!category ? styles.activeTab : ''}>
              All
            </Link>
            {categories.map((c) => (
              <Link key={c.id} to={`/shop?category=${c.slug}`} className={category === c.slug ? styles.activeTab : ''}>
                {c.name}
              </Link>
            ))}
          </nav>

          <div className={styles.right}>
            <span className={styles.count}>{products ? `${products.length} items` : ''}</span>
            <label className={styles.sort}>
              <span className="visually-hidden">Sort by</span>
              <select value={sort} onChange={(e) => setParam('sort', e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className={`container ${styles.results}`}>
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
}
