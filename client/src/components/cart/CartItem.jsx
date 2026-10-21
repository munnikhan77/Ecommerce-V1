import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import ProductImage from '../ui/ProductImage';
import QuantityPicker from '../ui/QuantityPicker';
import styles from './CartItem.module.css';

export default function CartItem({ item, compact = false }) {
  const { setQuantity, removeItem, closeCart } = useCart();
  const { price } = useSettings();

  return (
    <div className={styles.item}>
      <Link to={`/product/${item.slug}`} onClick={closeCart} className={styles.thumb}>
        <ProductImage src={item.image} tone={item.tone} alt={item.name} />
      </Link>
      <div className={styles.info}>
        <div className={styles.top}>
          <Link to={`/product/${item.slug}`} onClick={closeCart} className={styles.name}>
            {item.name}
          </Link>
          <span>{price(item.price * item.quantity)}</span>
        </div>
        <p className={styles.meta}>{[item.color, item.size].filter(Boolean).join(' · ')}</p>
        {compact ? (
          <p className={styles.meta}>Qty {item.quantity}</p>
        ) : (
          <div className={styles.bottom}>
            <QuantityPicker small value={item.quantity} onChange={(q) => setQuantity(item.key, q)} />
            <button className={styles.remove} onClick={() => removeItem(item.key)}>
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
