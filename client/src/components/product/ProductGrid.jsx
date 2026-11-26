import { ProductSkeleton, EmptyState } from '../ui/Loader';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ products, loading, columns = 4, ranked = false, className = '', emptyText = 'Try another category or search.' }) {
  if (!loading && products?.length === 0) {
    return <EmptyState title="Nothing here yet" text={emptyText} />;
  }

  return (
    <div className={`${styles.grid} ${className}`} style={{ '--cols': columns }}>
      {loading ? <ProductSkeleton count={columns} /> : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} rank={ranked ? i + 1 : null} />)}
    </div>
  );
}
