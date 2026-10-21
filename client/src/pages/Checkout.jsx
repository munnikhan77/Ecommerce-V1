import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import CartItem from '../components/cart/CartItem';
import Field, { RadioCard } from '../components/ui/Field';
import Button from '../components/ui/Button';
import { EmptyState, Loader } from '../components/ui/Loader';
import styles from './Checkout.module.css';

const EMPTY_FORM = { name: '', phone: '', email: '', city: '', address: '', note: '' };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { settings, price } = useSettings();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [insideValley, setInsideValley] = useState(true);
  const [chosenPayment, setPaymentMethod] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!settings) return <Loader />;
  const paymentMethod = chosenPayment || settings.paymentMethods[0];

  if (!items.length) {
    return (
      <EmptyState title="Your bag is empty" text="Add something you love, then come back here.">
        <Button variant="outline" to="/shop">
          Continue shopping
        </Button>
      </EmptyState>
    );
  }

  const { insideValley: valleyFee, outsideValley: outsideFee, freeAbove } = settings.shipping;
  const shipping = insideValley ? (subtotal >= freeAbove ? 0 : valleyFee) : outsideFee;
  const total = subtotal + shipping;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const order = await api.createOrder({
        customer: { ...form, insideValley },
        paymentMethod,
        items: items.map(({ productId, size, color, quantity }) => ({ productId, size, color, quantity })),
      });
      clearCart();
      navigate(`/order/${order.orderNumber}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className={`container ${styles.page}`}>
      <form className={styles.form} onSubmit={placeOrder}>
        <h1>Checkout</h1>

        <section>
          <h2>Contact</h2>
          <div className={styles.row}>
            <Field label="Full name" name="name" value={form.name} onChange={update} required autoComplete="name" />
            <Field
              label="Mobile number"
              name="phone"
              value={form.phone}
              onChange={update}
              required
              inputMode="tel"
              placeholder="98XXXXXXXX"
              autoComplete="tel"
            />
          </div>
          <Field label="Email (optional)" type="email" name="email" value={form.email} onChange={update} autoComplete="email" />
        </section>

        <section>
          <h2>Delivery</h2>
          <div className={styles.row}>
            <RadioCard
              name="zone"
              checked={insideValley}
              onChange={() => setInsideValley(true)}
              title="Inside Kathmandu Valley"
              text={`${price(valleyFee)} · free above ${price(freeAbove)} · 1–2 days`}
            />
            <RadioCard
              name="zone"
              checked={!insideValley}
              onChange={() => setInsideValley(false)}
              title="Outside Valley"
              text={`${price(outsideFee)} · 3–5 days`}
            />
          </div>
          <div className={styles.row}>
            <Field label="City / Town" name="city" value={form.city} onChange={update} required />
            <Field label="Area, street, landmark" name="address" value={form.address} onChange={update} required />
          </div>
          <Field as="textarea" label="Order note (optional)" name="note" value={form.note} onChange={update} />
        </section>

        <section>
          <h2>Payment</h2>
          <div className={styles.payments}>
            {settings.paymentMethods.map((m) => (
              <RadioCard
                key={m}
                name="payment"
                checked={paymentMethod === m}
                onChange={() => setPaymentMethod(m)}
                title={m}
                text={m === 'Cash on Delivery' ? 'Pay when your parcel arrives' : 'We’ll call to share payment details'}
              />
            ))}
          </div>
        </section>

        {error && <p className={styles.error}>{error}</p>}
        <Button full loading={submitting} type="submit">
          Place order · {price(total)}
        </Button>
      </form>

      <aside className={styles.summary}>
        <h2>Order summary</h2>
        {items.map((item) => (
          <CartItem key={item.key} item={item} compact />
        ))}
        <dl className={styles.totals}>
          <dt>Subtotal</dt>
          <dd>{price(subtotal)}</dd>
          <dt>Delivery</dt>
          <dd>{shipping === 0 ? 'Free' : price(shipping)}</dd>
          <dt className={styles.total}>Total</dt>
          <dd className={styles.total}>{price(total)}</dd>
        </dl>
      </aside>
    </div>
  );
}
