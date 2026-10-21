import { useSettings } from '../../context/SettingsContext';
import styles from './Price.module.css';

export default function Price({ price, comparePrice, large = false }) {
  const { price: fmt } = useSettings();
  const onSale = comparePrice && comparePrice > price;

  return (
    <span className={`${styles.price} ${large ? styles.large : ''}`}>
      <span className={onSale ? styles.sale : ''}>{fmt(price)}</span>
      {onSale && <s className={styles.compare}>{fmt(comparePrice)}</s>}
    </span>
  );
}
