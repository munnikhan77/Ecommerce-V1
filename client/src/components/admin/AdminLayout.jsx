import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import Icon from '../ui/Icon';
import styles from './AdminLayout.module.css';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: 'grid', end: true },
  { to: '/admin/orders', label: 'Orders', icon: 'package' },
  { to: '/admin/products', label: 'Products', icon: 'tag' },
  { to: '/admin/categories', label: 'Categories', icon: 'menu' },
  { to: '/admin/settings', label: 'Store Settings', icon: 'settings' },
];

export default function AdminLayout() {
  const { isAdmin, logout } = useAuth();
  const { settings } = useSettings();

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          {settings?.storeName}
          <small>Admin</small>
        </div>
        <nav>
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? styles.active : '')}>
              <Icon name={l.icon} size={18} />
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.bottom}>
          <a href="/" target="_blank" rel="noreferrer">
            <Icon name="arrow" size={18} /> View store
          </a>
          <button onClick={logout}>
            <Icon name="logout" size={18} /> Log out
          </button>
        </div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

// Page title row used at the top of every admin page
export function AdminHeader({ title, children }) {
  return (
    <header className={styles.header}>
      <h1>{title}</h1>
      <div className={styles.headerActions}>{children}</div>
    </header>
  );
}
