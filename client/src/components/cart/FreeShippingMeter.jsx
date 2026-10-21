import { useSettings } from '../../context/SettingsContext';
import styles from './FreeShippingMeter.module.css';

// "Add Rs 550 more for free delivery" progress bar
export default function FreeShippingMeter({ subtotal }) {
  const { settings, price } = useSettings();
  const target = settings?.shipping?.freeAbove;
  if (!target) return null;

  const left = target - subtotal;
  const percent = Math.min(100, (subtotal / target) * 100);

  return (
    <div className={styles.meter}>
      <p>
        {left > 0 ? (
          <>
            Add <strong>{price(left)}</strong> more for free valley delivery
          </>
        ) : (
          'You’ve unlocked free valley delivery ✦'
        )}
      </p>
      <div className={styles.track}>
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
