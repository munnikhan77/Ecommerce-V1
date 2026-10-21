import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Field from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import styles from './admin.module.css';

export default function Login() {
  const { isAdmin, login } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAdmin) return <Navigate to="/admin" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(password);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className={styles.login}>
      <form className={styles.loginCard} onSubmit={submit}>
        <p className="eyebrow">Store Admin</p>
        <h1>Welcome back</h1>
        <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
        {error && <p className={styles.error}>{error}</p>}
        <Button full loading={loading} type="submit">
          Log in
        </Button>
      </form>
    </div>
  );
}
