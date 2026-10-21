import { ProductSkeleton, EmptyState } from '../ui/Loader';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ products, loading, columns = 4, emptyText = 'Try another category or search.' }) {
  if (!loading && products?.length === 0) {
    return <EmptyState title="Nothing here yet" text={emptyText} />;
  }

  return (
    <div className={styles.grid} style={{ '--cols': columns }}>
      {loading ? <ProductSkeleton count={columns} /> : products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  );
}
