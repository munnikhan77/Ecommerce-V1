import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useFetch } from '../../hooks/useFetch';
import { useSettings } from '../../context/SettingsContext';
import { AdminHeader } from '../../components/admin/AdminLayout';
import Panel from '../../components/admin/Panel';
import ImageUploader from '../../components/admin/ImageUploader';
import TagInput from '../../components/admin/TagInput';
import ColorListInput from '../../components/admin/ColorListInput';
import Field from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import styles from './admin.module.css';

const NEW_PRODUCT = {
  name: '',
  categoryId: '',
  price: '',
  comparePrice: '',
  description: '',
  details: ['Breathable, skin-friendly fabric', 'Gentle wash, dry in shade'],
  sizes: ['S', 'M', 'L', 'XL'],
  colors: [],
  images: [],
  lookImage: '',
  lookGarment: '',
  stock: 10,
  featured: false,
  isNew: true,
  active: true,
};

export default function ProductEdit() {
  const { id } = useParams();
  const isNew = id === 'new';
  const { data, loading } = useFetch(() => (isNew ? Promise.resolve(NEW_PRODUCT) : api.getProduct(id)), [id]);

  if (loading || !data) return <Loader />;
  return <ProductForm key={id} initial={data} isNew={isNew} />;
}

function ProductForm({ initial, isNew }) {
  const navigate = useNavigate();
  const { categories, reloadCategories } = useSettings();
  const [product, setProduct] = useState({ ...initial, categoryId: initial.categoryId || categories[0]?.id || '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (value) => setProduct((p) => ({ ...p, [key]: value }));
  const onInput = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // the API returns extra fields (category, related) on GET — strip them
      const { category: _c, related: _r, ...body } = product;
      await api.saveProduct(body);
      reloadCategories();
      navigate('/admin/products');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <AdminHeader title={isNew ? 'New product' : product.name}>
        <Button size="sm" variant="outline" type="button" onClick={() => navigate('/admin/products')}>
          Cancel
        </Button>
        <Button size="sm" type="submit" loading={saving}>
          Save product
        </Button>
      </AdminHeader>
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.formGrid}>
        <div className={styles.stack}>
          <Panel title="Details">
            <Field label="Product name" name="name" value={product.name} onChange={onInput} required />
            <Field as="textarea" label="Description" name="description" value={product.description} onChange={onInput} />
            <div>
              <p className={styles.subLabel}>Fabric & care points</p>
              <TagInput value={product.details} onChange={set('details')} placeholder="e.g. 100% cotton — press Enter" />
            </div>
          </Panel>

          <Panel title="Photos">
            <ImageUploader value={product.images} onChange={set('images')} />
          </Panel>

          <Panel title="Fitting room look (homepage)">
            <p className={styles.subLabel}>
              A full-body photo of the model wearing this piece, with the background removed (transparent PNG/WebP).
              Products with a look appear in the homepage fitting room — Girls or Boys depending on the category.
            </p>
            <p className={styles.subLabel}>1 · Model wearing it</p>
            <ImageUploader
              value={product.lookImage ? [product.lookImage] : []}
              max={1}
              onChange={(urls) => set('lookImage')(urls[0] ?? '')}
            />
            <p className={styles.subLabel}>2 · The clothes alone (shown on the side cards)</p>
            <ImageUploader
              value={product.lookGarment ? [product.lookGarment] : []}
              max={1}
              onChange={(urls) => set('lookGarment')(urls[0] ?? '')}
            />
          </Panel>

          <Panel title="Variants">
            <div>
              <p className={styles.subLabel}>Sizes</p>
              <TagInput value={product.sizes} onChange={set('sizes')} placeholder="S, M, 34B… — press Enter" />
            </div>
            <div>
              <p className={styles.subLabel}>Colours</p>
              <ColorListInput value={product.colors} onChange={set('colors')} />
            </div>
          </Panel>
        </div>

        <div className={styles.stack}>
          <Panel title="Pricing & stock">
            <div className={styles.row2}>
              <Field label="Price (Rs)" type="number" min="0" name="price" value={product.price} onChange={onInput} required />
              <Field
                label="Old price"
                type="number"
                min="0"
                name="comparePrice"
                value={product.comparePrice ?? ''}
                onChange={onInput}
                hint="Shows as crossed out"
              />
            </div>
            <Field label="Stock" type="number" min="0" name="stock" value={product.stock} onChange={onInput} />
          </Panel>

          <Panel title="Organise">
            <Field as="select" label="Category" name="categoryId" value={product.categoryId} onChange={onInput}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Field>
            <label className={styles.check}>
              <input type="checkbox" name="active" checked={product.active} onChange={onInput} /> Visible in store
            </label>
            <label className={styles.check}>
              <input type="checkbox" name="featured" checked={product.featured} onChange={onInput} /> Show in Bestsellers
            </label>
            <label className={styles.check}>
              <input type="checkbox" name="isNew" checked={product.isNew} onChange={onInput} /> Mark as New
            </label>
          </Panel>
        </div>
      </div>
    </form>
  );
}
