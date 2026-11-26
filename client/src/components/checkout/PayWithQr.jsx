import { useRef, useState } from 'react';
import { api } from '../../api/client';
import Icon from '../ui/Icon';
import Field from '../ui/Field';
import styles from './PayWithQr.module.css';

/**
 * Shown at checkout when eSewa / Khalti is chosen: the shop's QR, the exact amount,
 * and a place to upload the payment screenshot (+ optional transaction code).
 * `proof` is the uploaded screenshot URL; the order can't be placed without it.
 */
export default function PayWithQr({ method, details, amount, price, proof, onProof, reference, onReference }) {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const { url } = await api.uploadPaymentProof(file);
      onProof(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      input.current.value = '';
    }
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(details.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the ID is still on screen */
    }
  };

  return (
    <div className={styles.box}>
      <div className={styles.qrSide}>
        <div className={styles.qr}>
          <img src={details.qr} alt={`${method} QR code`} />
        </div>
        {/* on a phone you can't scan your own screen — save it and scan from the gallery */}
        <a href={details.qr} download={`${method}-QR.png`} className={styles.download}>
          <Icon name="arrow" size={14} /> Download QR
        </a>
      </div>

      <div className={styles.info}>
        <p className="eyebrow">Pay with {method}</p>
        <p className={styles.amount}>{price(amount)}</p>

        {(details.name || details.id) && (
          <dl className={styles.account}>
            {details.name && (
              <>
                <dt>Name</dt>
                <dd>{details.name}</dd>
              </>
            )}
            {details.id && (
              <>
                <dt>{method} ID</dt>
                <dd>
                  {details.id}
                  <button type="button" onClick={copyId} className={styles.copy}>
                    {copied ? 'Copied ✓' : 'Copy'}
                  </button>
                </dd>
              </>
            )}
          </dl>
        )}

        <ol className={styles.steps}>
          <li>Open the {method} app and scan this QR (or use the ID above)</li>
          <li>
            Pay exactly <strong>{price(amount)}</strong>
          </li>
          <li>Upload the payment screenshot below, then place your order</li>
        </ol>

        <input ref={input} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files[0])} />
        {proof ? (
          <div className={styles.proof}>
            <img src={proof} alt="Your payment screenshot" />
            <div>
              <strong>
                <Icon name="check" size={16} /> Screenshot added
              </strong>
              <button type="button" onClick={() => input.current.click()} className={styles.change}>
                Change
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className={styles.uploadBtn} onClick={() => input.current.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload payment screenshot'}
          </button>
        )}
        {error && <p className={styles.error}>{error}</p>}

        <Field
          label="Transaction code (optional)"
          name="paymentRef"
          value={reference}
          onChange={(e) => onReference(e.target.value)}
          placeholder="e.g. 0A1B2C3"
        />
      </div>
    </div>
  );
}
