import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSettings } from '../../context/SettingsContext';
import { AdminHeader } from '../../components/admin/AdminLayout';
import { StatusBadge } from '../../components/admin/Panel';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import ProductImage from '../../components/ui/ProductImage';
import { Loader } from '../../components/ui/Loader';
import table from '../../components/admin/DataTable.module.css';

export default function Products() {
  const { categories, price, reloadCategories } = useSettings();
  const { data: products, loading, reload } = useFetch(() => api.getProducts({ all: 1, sort: 'newest' }), []);

  const remove = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    await api.deleteProduct(product.id);
    reload();
    reloadCategories();
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? '—';

  return (
    <>
      <AdminHeader title="Products">
        <Button size="sm" to="/admin/products/new">
          + Add product
        </Button>
      </AdminHeader>

      {loading ? (
        <Loader />
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/admin/products/${p.id}`} className={table.nameCell}>
                      <span className={table.thumb}>
                        <ProductImage src={p.images[0]} tone={p.colors[0]?.hex} />
                      </span>
                      {p.name}
                    </Link>
                  </td>
                  <td>{categoryName(p.categoryId)}</td>
                  <td>{price(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>
                    <StatusBadge status={p.active ? 'delivered' : 'cancelled'} label={p.active ? 'Live' : 'Hidden'} />{' '}
                    {p.featured && <span className={table.muted}>★ featured</span>}
                  </td>
                  <td>
                    <div className={table.actions}>
                      <Link to={`/product/${p.slug}`} target="_blank" className={table.iconBtn} title="View in store">
                        <Icon name="arrow" size={16} />
                      </Link>
                      <Link to={`/admin/products/${p.id}`} className={table.iconBtn} title="Edit">
                        <Icon name="edit" size={16} />
                      </Link>
                      <button onClick={() => remove(p)} className={`${table.iconBtn} ${table.danger}`} title="Delete">
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
