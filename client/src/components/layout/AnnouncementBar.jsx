import { useSettings } from '../../context/SettingsContext';
import styles from './AnnouncementBar.module.css';

export default function AnnouncementBar() {
  const { settings } = useSettings();
  if (!settings?.announcement) return null;

  // the text is repeated so the scrolling marquee never shows a gap
  const items = Array.from({ length: 4 }, (_, i) => <span key={i}>{settings.announcement}</span>);

  return (
    <div className={styles.bar}>
      <div className={styles.track}>
        {items}
        {items}
      </div>
    </div>
  );
}
