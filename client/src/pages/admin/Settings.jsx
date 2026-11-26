import { useState } from 'react';
import { api } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { AdminHeader } from '../../components/admin/AdminLayout';
import Panel from '../../components/admin/Panel';
import ImageUploader from '../../components/admin/ImageUploader';
import TagInput from '../../components/admin/TagInput';
import Field from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import styles from './admin.module.css';

const SECTION_FIELDS = [
  { key: 'genderSplit', label: 'Women | Men split page (after the slides)', fields: ['split'] },
  { key: 'promises', label: 'Promise strip', fields: [] },
  { key: 'categories', label: 'Shop by category', fields: ['eyebrow', 'title'] },
  { key: 'bestsellers', label: 'Bestsellers', fields: ['eyebrow', 'title'] },
  { key: 'story', label: 'Our story (edit it in the panel above)', fields: [] },
  { key: 'newArrivals', label: 'New arrivals', fields: ['eyebrow', 'title', 'marquee'] },
  { key: 'social', label: 'Instagram banner', fields: ['eyebrow', 'title'] },
];

export default function Settings() {
  const { settings, reload } = useSettings();
  if (!settings) return <Loader />;
  return <SettingsForm initial={settings} onSaved={reload} />;
}

function SettingsForm({ initial, onSaved }) {
  const [s, setS] = useState(initial);
  const [status, setStatus] = useState({ saving: false, message: '' });

  // helpers to update top-level, nested and list values
  const top = (e) => setS({ ...s, [e.target.name]: e.target.value });
  const nested = (group) => (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setS({ ...s, [group]: { ...s[group], [e.target.name]: value } });
  };
  const listItem = (list, index, changes) => setS({ ...s, [list]: s[list].map((item, i) => (i === index ? { ...item, ...changes } : item)) });
  const payment = (method, changes) =>
    setS({ ...s, paymentDetails: { ...s.paymentDetails, [method]: { ...s.paymentDetails?.[method], ...changes } } });
  const onlineMethods = s.paymentMethods.filter((m) => m !== 'Cash on Delivery');

  // storefront wording lives in s.content.<group>.<field> (see server/src/db/contentDefaults.js)
  const content = (group, changes) => setS({ ...s, content: { ...s.content, [group]: { ...s.content[group], ...changes } } });
  const section = (key, changes) =>
    content('sections', { [key]: { ...s.content.sections[key], ...changes } });
  const storyValue = (index, changes) =>
    setS({ ...s, story: { ...s.story, values: s.story.values.map((v, i) => (i === index ? { ...v, ...changes } : v)) } });


  const save = async (e) => {
    e.preventDefault();
    setStatus({ saving: true, message: '' });
    try {
      await api.updateSettings(s);
      onSaved();
      setStatus({ saving: false, message: 'Saved ✓ — changes are live' });
    } catch (err) {
      setStatus({ saving: false, message: err.message });
    }
  };

  return (
    <form onSubmit={save}>
      <AdminHeader title="Store settings">
        {status.message && <span className={styles.success}>{status.message}</span>}
        <Button size="sm" type="submit" loading={status.saving}>
          Save changes
        </Button>
      </AdminHeader>

      <div className={styles.formGrid}>
        <div className={styles.stack}>
          <Panel title="Hero — fitting room (first screen)">
            <p className={styles.uploadHint}>
              The first screen shows a model in the middle and the clothes on cards beside the model, with a Girls / Boys switch.
              It fills itself from your products: open any product (Products → Edit) and upload its two
              &ldquo;Fitting room look&rdquo; photos — the model wearing it, and the clothes alone. Girls or Boys comes from the
              product&rsquo;s category. The big name comes from the store name below.
            </p>
            <Button size="sm" variant="outline" to="/admin/products">
              Go to products
            </Button>
          </Panel>

          <Panel title="Our story section">
            <Field label="Small text" name="eyebrow" value={s.story.eyebrow} onChange={nested('story')} />
            <Field label="Title" name="title" value={s.story.title} onChange={nested('story')} />
            <Field as="textarea" label="Text" name="body" value={s.story.body} onChange={nested('story')} />
            <p className={styles.subLabel}>Small round photos between the title words (up to 2)</p>
            <ImageUploader max={2} value={s.story.pills ?? []} onChange={(pills) => setS({ ...s, story: { ...s.story, pills } })} />
            <p className={styles.subLabel}>Points under the story (01, 02, 03…)</p>
            {s.story.values.map((v, i) => (
              <div key={i} className={styles.row2}>
                <Field label={`Point ${i + 1} title`} value={v.title} onChange={(e) => storyValue(i, { title: e.target.value })} />
                <Field label="Text" value={v.text} onChange={(e) => storyValue(i, { text: e.target.value })} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => setS({ ...s, story: { ...s.story, values: [...s.story.values, { title: '', text: '' }] } })}
              >
                + Add point
              </Button>
              {s.story.values.length > 0 && (
                <Button size="sm" variant="text" type="button" onClick={() => setS({ ...s, story: { ...s.story, values: s.story.values.slice(0, -1) } })}>
                  Remove last
                </Button>
              )}
            </div>
            <div style={{ maxWidth: 140 }}>
              <ImageUploader max={1} value={s.story.image ? [s.story.image] : []} onChange={(u) => setS({ ...s, story: { ...s.story, image: u[0] ?? '' } })} />
            </div>
          </Panel>

          <Panel title="Saanjh mood (dusk touches)">
            {[
              ['cursor', 'Moon cursor with falling stars (computers only)'],
              ['stars', 'Twinkling stars on the slides and footer'],
              ['skyBar', 'Sunset-to-night scroll line at the top'],
            ].map(([key, label]) => (
              <label key={key} className={styles.check}>
                <input type="checkbox" checked={s.content.mood[key]} onChange={(e) => content('mood', { [key]: e.target.checked })} /> {label}
              </label>
            ))}
          </Panel>

          <Panel title="Homepage sections">
            <p className={styles.uploadHint}>Untick to hide a section. In titles, *word* makes it italic and a new line breaks the line.</p>
            {SECTION_FIELDS.map(({ key, label, fields }) => {
              const sec = s.content.sections[key];
              return (
                <div key={key} className={styles.slide}>
                  <label className={styles.check}>
                    <input type="checkbox" checked={sec.show} onChange={(e) => section(key, { show: e.target.checked })} /> <strong>{label}</strong>
                  </label>
                  {fields.includes('eyebrow') && (
                    <div className={styles.row2}>
                      <Field label="Small text" value={sec.eyebrow} onChange={(e) => section(key, { eyebrow: e.target.value })} />
                      {fields.includes('marquee') && (
                        <Field label="Moving background words" value={sec.marquee} onChange={(e) => section(key, { marquee: e.target.value })} />
                      )}
                    </div>
                  )}
                  {fields.includes('split') &&
                    ['women', 'men'].map((side) => (
                      <div key={side} className={styles.row2}>
                        <div>
                          <p className={styles.subLabel}>{side === 'women' ? 'Women' : 'Men'} photo</p>
                          <ImageUploader
                            max={1}
                            value={sec[side].image ? [sec[side].image] : []}
                            onChange={(u) => section(key, { [side]: { ...sec[side], image: u[0] ?? '' } })}
                          />
                        </div>
                        <div className={styles.stack}>
                          <Field label="Big word" value={sec[side].label} onChange={(e) => section(key, { [side]: { ...sec[side], label: e.target.value } })} />
                          <Field label="Line under it" value={sec[side].subtitle} onChange={(e) => section(key, { [side]: { ...sec[side], subtitle: e.target.value } })} />
                        </div>
                      </div>
                    ))}
                  {fields.includes('title') && (
                    <Field as="textarea" rows={2} label="Title" value={sec.title} onChange={(e) => section(key, { title: e.target.value })} />
                  )}
                </div>
              );
            })}
          </Panel>

          <Panel title="Promise strip (under the slides)">
            {s.promises.map((p, i) => (
              <div key={i} className={styles.row2}>
                <Field label={`Title ${i + 1}`} value={p.title} onChange={(e) => listItem('promises', i, { title: e.target.value })} />
                <Field label="Text" value={p.text} onChange={(e) => listItem('promises', i, { text: e.target.value })} />
              </div>
            ))}
          </Panel>
        </div>

        <div className={styles.stack}>
          <Panel title="Brand">
            <div className={styles.row2}>
              <Field label="Store name" name="storeName" value={s.storeName} onChange={top} />
              <Field label="Name in Nepali (logo)" name="storeNameNepali" value={s.storeNameNepali ?? ''} onChange={top} />
            </div>
            <Field label="Tagline" name="tagline" value={s.tagline} onChange={top} />
            <Field as="textarea" label="Top announcement bar" name="announcement" value={s.announcement} onChange={top} rows={3} />
          </Panel>

          <Panel title="Delivery charges (Rs)">
            <div className={styles.row2}>
              <Field label="Inside valley" type="number" name="insideValley" value={s.shipping.insideValley} onChange={nested('shipping')} />
              <Field label="Outside valley" type="number" name="outsideValley" value={s.shipping.outsideValley} onChange={nested('shipping')} />
            </div>
            <Field label="Free valley delivery above" type="number" name="freeAbove" value={s.shipping.freeAbove} onChange={nested('shipping')} />
            <div className={styles.row2}>
              <Field label="Valley delivery time" value={s.content.delivery.valleyDays} onChange={(e) => content('delivery', { valleyDays: e.target.value })} />
              <Field label="Outside delivery time" value={s.content.delivery.outsideDays} onChange={(e) => content('delivery', { outsideDays: e.target.value })} />
            </div>
          </Panel>

          <Panel title="Product page">
            <p className={styles.subLabel}>Short points under Add to Bag</p>
            <TagInput value={s.content.product.perks} onChange={(perks) => content('product', { perks })} placeholder="e.g. Cash on Delivery available — press Enter" />
            <Field as="textarea" label="Exchange & packaging note" value={s.content.product.exchange} onChange={(e) => content('product', { exchange: e.target.value })} />
            <div className={styles.row2}>
              <Field label="“You may also like” small text" value={s.content.product.relatedEyebrow} onChange={(e) => content('product', { relatedEyebrow: e.target.value })} />
              <Field label="“You may also like” title" value={s.content.product.relatedTitle} onChange={(e) => content('product', { relatedTitle: e.target.value })} />
            </div>
          </Panel>

          <Panel title="Search">
            <Field label="Search box hint" value={s.content.search.placeholder} onChange={(e) => content('search', { placeholder: e.target.value })} />
            <p className={styles.subLabel}>Popular searches</p>
            <TagInput value={s.content.search.popular} onChange={(popular) => content('search', { popular })} placeholder="e.g. Satin — press Enter" />
          </Panel>

          <Panel title="Footer">
            <p className={styles.subLabel}>Help column</p>
            <TagInput value={s.content.footer.help} onChange={(help) => content('footer', { help })} placeholder="e.g. 7-day size exchange — press Enter" />
            <Field label="Bottom-right note" value={s.content.footer.note} onChange={(e) => content('footer', { note: e.target.value })} />
            <Field
              label="Line under the moon at the very bottom"
              value={s.content.footer.goodnight ?? ''}
              onChange={(e) => content('footer', { goodnight: e.target.value })}
            />
          </Panel>

          <Panel title="Online payments (QR at checkout)">
            {onlineMethods.map((method) => {
              const d = s.paymentDetails?.[method] ?? {};
              return (
                <div key={method} className={styles.slide}>
                  <div className={styles.slideHead}>
                    <strong>{method}</strong>
                    <span className={styles.subLabel}>{d.qr ? 'Customers pay at checkout' : 'No QR — you call the customer'}</span>
                  </div>
                  <div className={styles.row2}>
                    <div>
                      <p className={styles.subLabel}>QR code</p>
                      <ImageUploader max={1} value={d.qr ? [d.qr] : []} onChange={(u) => payment(method, { qr: u[0] ?? '' })} />
                    </div>
                    <div className={styles.stack}>
                      <Field label="Account name" value={d.name ?? ''} onChange={(e) => payment(method, { name: e.target.value })} />
                      <Field label={`${method} ID / number`} value={d.id ?? ''} onChange={(e) => payment(method, { id: e.target.value })} />
                    </div>
                  </div>
                </div>
              );
            })}
          </Panel>

          <Panel title="Contact">
            <Field label="Phone" name="phone" value={s.phone} onChange={top} />
            <Field label="Email" name="email" value={s.email} onChange={top} />
            <Field label="Address" name="address" value={s.address} onChange={top} />
          </Panel>

          <Panel title="Social links">
            <Field label="Instagram" name="instagram" value={s.social.instagram} onChange={nested('social')} />
            <Field label="Facebook" name="facebook" value={s.social.facebook} onChange={nested('social')} />
            <Field label="TikTok" name="tiktok" value={s.social.tiktok} onChange={nested('social')} />
          </Panel>
        </div>
      </div>
    </form>
  );
}
