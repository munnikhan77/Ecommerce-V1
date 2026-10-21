import { useCart } from '../../context/CartContext';
import { useSettings } from '../../context/SettingsContext';
import Drawer from '../layout/Drawer';
import Button from '../ui/Button';
import { EmptyState } from '../ui/Loader';
import CartItem from './CartItem';
import FreeShippingMeter from './FreeShippingMeter';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { items, subtotal, count, isOpen, closeCart } = useCart();
  const { price } = useSettings();

  const footer = items.length > 0 && (
    <div className={styles.footer}>
      <div className={styles.row}>
        <span>Subtotal</span>
        <span>{price(subtotal)}</span>
      </div>
      <p className={styles.note}>Delivery calculated at checkout.</p>
      <Button to="/checkout" full onClick={closeCart}>
        Checkout
      </Button>
    </div>
  );

  return (
    <Drawer open={isOpen} onClose={closeCart} title={`Your Bag (${count})`} footer={footer}>
      {items.length === 0 ? (
        <EmptyState title="Your bag is empty" text="Find something soft to sleep in.">
          <Button variant="outline" to="/shop" onClick={closeCart}>
            Start Shopping
          </Button>
        </EmptyState>
      ) : (
        <>
          <FreeShippingMeter subtotal={subtotal} />
          {items.map((item) => (
            <CartItem key={item.key} item={item} />
          ))}
        </>
      )}
    </Drawer>
  );
}
