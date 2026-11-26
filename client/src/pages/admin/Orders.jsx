import { useState } from 'react';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSettings } from '../../context/SettingsContext';
import { AdminHeader } from '../../components/admin/AdminLayout';
import { StatusBadge } from '../../components/admin/Panel';
import { Loader, EmptyState } from '../../components/ui/Loader';
import { formatDate } from '../../utils/format';
import table from '../../components/admin/DataTable.module.css';
import styles from './admin.module.css';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAYMENT_LABELS = { awaiting: 'Check payment', verified: 'Paid ✓', rejected: 'Payment rejected' };

export default function Orders() {
  const { price } = useSettings();
  const [filter, setFilter] = useState('');
  const { data: orders, loading, reload } = useFetch(() => api.getOrders({ status: filter }), [filter]);

  const [error, setError] = useState('');

  const changeStatus = async (order, status) => {
    setError('');
    try {
      await api.updateOrderStatus(order.id, status);
    } catch (err) {
      setError(err.message);
    }
    reload();
  };

  const setPayment = async (order, paymentStatus) => {
    setError('');
    try {
      await api.updatePaymentStatus(order.id, paymentStatus);
    } catch (err) {
      setError(err.message);
    }
    reload();
  };

  const remove = async (order) => {
    if (!window.confirm(`Delete order #${order.orderNumber}? This cannot be undone.`)) return;
    setError('');
    try {
      await api.deleteOrder(order.id);
    } catch (err) {
      setError(err.message);
    }
    reload();
  };

  return (
    <>
      <AdminHeader title="Orders" />

      <div className={styles.filters}>
        {['', ...STATUSES].map((s) => (
          <button key={s || 'all'} className={filter === s ? styles.on : ''} onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders here" />
      ) : (
        <div className={table.wrap}>
          <table className={table.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>#{o.orderNumber}</strong>
                    <div className={table.muted}>{formatDate(o.createdAt)}</div>
                  </td>
                  <td>
                    <div className={styles.orderCard}>
                      {o.customer.name}
                      <a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a>
                      <span className={table.muted}>
                        {o.customer.address}, {o.customer.city} {o.customer.insideValley ? '(Valley)' : '(Outside)'}
                      </span>
                      {o.customer.note && <span className={table.muted}>Note: {o.customer.note}</span>}
                    </div>
                  </td>
                  <td>
                    {o.items.map((i) => (
                      <div key={`${i.productId}${i.size}${i.color}`}>
                        {i.quantity} × {i.name}
                        <span className={table.muted}> {[i.color, i.size].filter(Boolean).join(' / ')}</span>
                      </div>
                    ))}
                  </td>
                  <td>
                    {price(o.total)}
                    <div className={table.muted}>{o.paymentMethod}</div>
                    {o.paymentStatus && o.paymentStatus !== 'cod' && (
                      <div className={styles.payment}>
                        <StatusBadge status={`pay-${o.paymentStatus}`} label={PAYMENT_LABELS[o.paymentStatus]} />
                        {o.paymentProof ? (
                          <a href={o.paymentProof} target="_blank" rel="noreferrer" className={styles.proof} title="Open screenshot">
                            <img src={o.paymentProof} alt="Payment screenshot" />
                          </a>
                        ) : (
                          <span className={table.muted}>No screenshot</span>
                        )}
                        {o.paymentRef && <span className={table.muted}>Ref: {o.paymentRef}</span>}
                        <div className={styles.paymentActions}>
                          {o.paymentStatus !== 'verified' && (
                            <button type="button" onClick={() => setPayment(o, 'verified')}>
                              Verify
                            </button>
                          )}
                          {o.paymentStatus !== 'rejected' && (
                            <button type="button" onClick={() => setPayment(o, 'rejected')}>
                              Reject
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                  <td>
                    <StatusBadge status={o.status} />
                    <div style={{ marginTop: 8 }}>
                      <select className={styles.statusSelect} value={o.status} onChange={(e) => changeStatus(o, e.target.value)}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="button" className={styles.linkDanger} onClick={() => remove(o)}>
                      Delete
                    </button>
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
