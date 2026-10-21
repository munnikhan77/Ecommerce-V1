import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useFetch } from '../hooks/useFetch';
import { useSettings } from '../context/SettingsContext';
import Button from '../components/ui/Button';
import Icon from '../components/ui/Icon';
import { Loader, EmptyState } from '../components/ui/Loader';
import styles from './OrderSuccess.module.css';

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const { data: order, loading } = useFetch(() => api.trackOrder(orderNumber), [orderNumber]);
  const { settings, price } = useSettings();

  if (loading) return <Loader />;
  if (!order) return <EmptyState title="Order not found" />;

  return (
    <div className={`container ${styles.page}`}>
      <span className={styles.icon}>
        <Icon name="check" size={30} />
      </span>
      <p className="eyebrow">Order #{order.orderNumber}</p>
      <h1>
        Thank you, <em>{order.customer.name.split(' ')[0]}</em>
      </h1>
      <p className={styles.text}>
        We’ve received your order and will call you on <strong>{order.customer.phone}</strong> to confirm it shortly.
        {order.paymentMethod !== 'Cash on Delivery' && ` We’ll share ${order.paymentMethod} payment details on that call.`}
      </p>

      <div className={styles.card}>
        {order.items.map((item) => (
          <div key={`${item.productId}${item.size}${item.color}`} className={styles.line}>
            <span>
              {item.name} <small>{[item.color, item.size, `× ${item.quantity}`].filter(Boolean).join(' · ')}</small>
            </span>
            <span>{price(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className={styles.line}>
          <span>Delivery</span>
          <span>{order.shipping ? price(order.shipping) : 'Free'}</span>
        </div>
        <div className={`${styles.line} ${styles.total}`}>
          <span>Total · {order.paymentMethod}</span>
          <span>{price(order.total)}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <Button to="/shop">Continue shopping</Button>
        {settings?.phone && (
          <Button variant="outline" href={`tel:${settings.phone}`}>
            Call us
          </Button>
        )}
      </div>
    </div>
  );
}
