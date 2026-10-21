import { useState } from 'react';
import { api } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { AdminHeader } from '../../components/admin/AdminLayout';
import Panel from '../../components/admin/Panel';
import ImageUploader from '../../components/admin/ImageUploader';
import Field from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import styles from './admin.module.css';

const EMPTY = { name: '', tagline: '', image: '', tone: '#d9c2b8', sortOrder: 10 };

export default function Categories() {
  const { categories, reloadCategories } = useSettings();

  return (
    <>
      <AdminHeader title="Categories" />
      <div className={styles.stack}>
        {categories.map((c) => (
          <CategoryForm key={c.id} initial={c} onSaved={reloadCategories} />
        ))}
        <CategoryForm key={`new-${categories.length}`} initial={EMPTY} onSaved={reloadCategories} />
      </div>
    </>
  );
}

function CategoryForm({ initial, onSaved }) {
  const [cat, setCat] = useState(initial);
  const [status, setStatus] = useState({ saving: false, message: '', error: '' });
  const isNew = !initial.id;

  const onInput = (e) => setCat({ ...cat, [e.target.name]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setStatus({ saving: true, message: '', error: '' });
    try {
      await api.saveCategory(cat);
      setStatus({ saving: false, message: 'Saved ✓', error: '' });
      onSaved();
    } catch (err) {
      setStatus({ saving: false, message: '', error: err.message });
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    try {
      await api.deleteCategory(cat.id);
      onSaved();
    } catch (err) {
      setStatus({ saving: false, message: '', error: err.message });
    }
  };

  return (
    <form onSubmit={save}>
      <Panel
        title={isNew ? 'Add a new category' : cat.name}
        action={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {status.message && <span className={styles.success}>{status.message}</span>}
            {!isNew && (
              <Button size="sm" variant="outline" type="button" onClick={remove}>
                Delete
              </Button>
            )}
            <Button size="sm" type="submit" loading={status.saving}>
              {isNew ? 'Add' : 'Save'}
            </Button>
          </div>
        }
      >
        {status.error && <p className={styles.error}>{status.error}</p>}
        <div className={styles.row3}>
          <Field label="Name" name="name" value={cat.name} onChange={onInput} required />
          <Field label="Short tagline" name="tagline" value={cat.tagline} onChange={onInput} />
          <div className={styles.row2}>
            <Field label="Order" type="number" name="sortOrder" value={cat.sortOrder} onChange={onInput} />
            <Field label="Colour" type="color" name="tone" value={cat.tone} onChange={onInput} />
          </div>
        </div>
        <div style={{ maxWidth: 140 }}>
          <ImageUploader max={1} value={cat.image ? [cat.image] : []} onChange={(urls) => setCat({ ...cat, image: urls[0] ?? '' })} />
        </div>
      </Panel>
    </form>
  );
}
