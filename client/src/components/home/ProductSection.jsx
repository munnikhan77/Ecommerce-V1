import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import ProductGrid from '../product/ProductGrid';
import Button from '../ui/Button';
import SectionHeading from '../ui/SectionHeading';

/**
 * A titled row of products loaded from the API.
 *   <ProductSection title="Bestsellers" query={{ featured: true, limit: 4 }} />
 */
export default function ProductSection({ eyebrow, title, query, link = '/shop', tinted = false }) {
  const { data, loading } = useFetch(() => api.getProducts(query), [JSON.stringify(query)]);

  return (
    <section className="section" style={tinted ? { background: 'var(--bg-soft)' } : undefined}>
      <div className="container">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          action={
            <Button variant="text" to={link}>
              View all
            </Button>
          }
        />
        <ProductGrid products={data} loading={loading} />
      </div>
    </section>
  );
}
