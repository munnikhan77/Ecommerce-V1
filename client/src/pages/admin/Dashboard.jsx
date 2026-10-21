import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSettings } from '../../context/SettingsContext';
import { AdminHeader } from '../../components/admin/AdminLayout';
import Panel, { StatusBadge } from '../../components/admin/Panel';
import Button from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import { formatDate } from '../../utils/format';
import table from '../../components/admin/DataTable.module.css';
import styles from './admin.module.css';

export default function Dashboard() {
  const { price } = useSettings();
  const { data: stats } = useFetch(() => api.getStats(), []);
  const { data: orders } = useFetch(() => api.getOrders(), []);

  if (!stats || !orders) return <Loader />;

  const cards = [
    { label: 'Total revenue', value: price(stats.revenue) },
    { label: 'Orders', value: stats.totalOrders },
    { label: 'Waiting to confirm', value: stats.pendingOrders },
    { label: 'Products', value: stats.totalProducts },
  ];

  return (
    <>
      <AdminHeader title="Dashboard">
        <Button size="sm" to="/admin/products/new">
          + Add product
        </Button>
      </AdminHeader>

      <div className={styles.stats}>
        {cards.map((c) => (
          <div key={c.label} className={styles.stat}>
            <span>{c.label}</span>
            <strong>{c.value}</strong>
          </div>
        ))}
      </div>

      <div className={styles.twoCol}>
        <Panel title="Latest orders" action={<Link to="/admin/orders">View all →</Link>}>
          {orders.length === 0 ? (
            <p className={table.muted}>No orders yet. Share your store link on Instagram & Facebook!</p>
          ) : (
            <table className={table.table}>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td>
                      #{o.orderNumber}
                      <div className={table.muted}>{formatDate(o.createdAt)}</div>
                    </td>
                    <td>{o.customer.name}</td>
                    <td>{price(o.total)}</td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <Panel title="Low stock">
          {stats.lowStock.length === 0 ? (
            <p className={table.muted}>All products have enough stock.</p>
          ) : (
            stats.lowStock.map((p) => (
              <Link key={p.id} to={`/admin/products/${p.id}`} className={styles.orderCard}>
                {p.name} <span className={table.muted}>{p.stock} left</span>
              </Link>
            ))
          )}
        </Panel>
      </div>
    </>
  );
}
