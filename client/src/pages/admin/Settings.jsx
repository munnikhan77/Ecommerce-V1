import { useState } from 'react';
import { api } from '../../api/client';
import { useSettings } from '../../context/SettingsContext';
import { AdminHeader } from '../../components/admin/AdminLayout';
import Panel from '../../components/admin/Panel';
import ImageUploader from '../../components/admin/ImageUploader';
import Field from '../../components/ui/Field';
import Button from '../../components/ui/Button';
import { Loader } from '../../components/ui/Loader';
import styles from './admin.module.css';

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

  const addSlide = () =>
    setS({
      ...s,
      heroSlides: [
        ...s.heroSlides,
        { id: `hero-${Date.now()}`, eyebrow: '', title: 'New slide', subtitle: '', ctaText: 'Shop now', ctaLink: '/shop', image: '', video: '', tone: '#cfa99c' },
      ],
    });

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
          <Panel title="Homepage slides">
            {s.heroSlides.map((slide, i) => {
              const set = (e) => listItem('heroSlides', i, { [e.target.name]: e.target.value });
              return (
                <div key={slide.id} className={styles.slide}>
                  <div className={styles.slideHead}>
                    <strong>Slide {i + 1}</strong>
                    <Button
                      size="sm"
                      variant="text"
                      type="button"
                      onClick={() => setS({ ...s, heroSlides: s.heroSlides.filter((_, n) => n !== i) })}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className={styles.row2}>
                    <Field label="Small text" name="eyebrow" value={slide.eyebrow} onChange={set} />
                    <Field label="Background colour" type="color" name="tone" value={slide.tone} onChange={set} />
                  </div>
                  <Field as="textarea" label="Big title (new line = line break)" name="title" value={slide.title} onChange={set} rows={2} />
                  <Field label="Subtitle" name="subtitle" value={slide.subtitle} onChange={set} />
                  <div className={styles.row2}>
                    <Field label="Button text" name="ctaText" value={slide.ctaText} onChange={set} />
                    <Field label="Button link" name="ctaLink" value={slide.ctaLink} onChange={set} />
                  </div>
                  <div className={styles.row2}>
                    <div>
                      <p className={styles.subLabel}>Photo</p>
                      <ImageUploader max={1} value={slide.image ? [slide.image] : []} onChange={(u) => listItem('heroSlides', i, { image: u[0] ?? '' })} />
                    </div>
                    <div>
                      <p className={styles.subLabel}>Video (optional)</p>
                      <ImageUploader
                        max={1}
                        accept="video/mp4,video/webm"
                        value={slide.video ? [slide.video] : []}
                        onChange={(u) => listItem('heroSlides', i, { video: u[0] ?? '' })}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            <Button size="sm" variant="outline" type="button" onClick={addSlide}>
              + Add slide
            </Button>
          </Panel>

          <Panel title="Our story section">
            <Field label="Small text" name="eyebrow" value={s.story.eyebrow} onChange={nested('story')} />
            <Field label="Title" name="title" value={s.story.title} onChange={nested('story')} />
            <Field as="textarea" label="Text" name="body" value={s.story.body} onChange={nested('story')} />
            <div style={{ maxWidth: 140 }}>
              <ImageUploader max={1} value={s.story.image ? [s.story.image] : []} onChange={(u) => setS({ ...s, story: { ...s.story, image: u[0] ?? '' } })} />
            </div>
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
            <Field label="Store name" name="storeName" value={s.storeName} onChange={top} />
            <Field label="Tagline" name="tagline" value={s.tagline} onChange={top} />
            <Field as="textarea" label="Top announcement bar" name="announcement" value={s.announcement} onChange={top} rows={3} />
          </Panel>

          <Panel title="Delivery charges (Rs)">
            <div className={styles.row2}>
              <Field label="Inside valley" type="number" name="insideValley" value={s.shipping.insideValley} onChange={nested('shipping')} />
              <Field label="Outside valley" type="number" name="outsideValley" value={s.shipping.outsideValley} onChange={nested('shipping')} />
            </div>
            <Field label="Free valley delivery above" type="number" name="freeAbove" value={s.shipping.freeAbove} onChange={nested('shipping')} />
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
