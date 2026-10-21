import { useRef, useState } from 'react';
import { api } from '../../api/client';
import Icon from '../ui/Icon';
import styles from './ImageUploader.module.css';

/**
 * Upload + reorder + remove images.
 *   <ImageUploader value={images} onChange={setImages} />           (many)
 *   <ImageUploader value={image ? [image] : []} max={1} … />         (single)
 * Set accept="video/*" to upload a video instead.
 */
export default function ImageUploader({ value = [], onChange, max = 8, accept = 'image/*' }) {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const upload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setError('');
    try {
      const { urls } = await api.upload([...files].slice(0, max - value.length));
      onChange([...value, ...urls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      input.current.value = '';
    }
  };

  const remove = (i) => onChange(value.filter((_, n) => n !== i));
  const makeFirst = (i) => onChange([value[i], ...value.filter((_, n) => n !== i)]);
  const isVideo = (url) => /\.(mp4|webm)$/i.test(url);

  return (
    <div>
      <div className={styles.grid}>
        {value.map((url, i) => (
          <div key={url} className={styles.item}>
            {isVideo(url) ? <video src={url} muted /> : <img src={url} alt="" />}
            {i === 0 && max > 1 && <span className={styles.main}>Main</span>}
            <div className={styles.tools}>
              {i > 0 && (
                <button type="button" onClick={() => makeFirst(i)} title="Make main photo">
                  ★
                </button>
              )}
              <button type="button" onClick={() => remove(i)} title="Remove">
                <Icon name="close" size={14} />
              </button>
            </div>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            className={styles.add}
            onClick={() => input.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              upload(e.dataTransfer.files);
            }}
          >
            {uploading ? 'Uploading…' : <><Icon name="plus" /> Add {accept.startsWith('video') ? 'video' : 'photo'}</>}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept={accept} multiple={max > 1} hidden onChange={(e) => upload(e.target.files)} />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
