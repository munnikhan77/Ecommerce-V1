import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { config } from '../config.js';
import { HttpError } from '../utils/httpError.js';

/*
 * Where uploaded files go:
 *  - laptop: the server/uploads folder, served at /uploads/…
 *  - Vercel: Vercel Blob (BLOB_READ_WRITE_TOKEN is set), which returns a full https:// URL.
 *    Vercel functions accept at most ~4.5 MB per request, so the limits are lower there.
 */
const useBlob = Boolean(config.blobToken);
const MAX_FILE = useBlob ? 4 * 1024 * 1024 : 25 * 1024 * 1024;

const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.mp4', '.webm'];
const PROOF_TYPES = ['.jpg', '.jpeg', '.png', '.webp'];

const fileName = (prefix, original, bytes = 4) =>
  `${prefix}${Date.now()}-${crypto.randomBytes(bytes).toString('hex')}${path.extname(original).toLowerCase()}`;

async function store(file, name) {
  if (!useBlob) {
    fs.mkdirSync(config.uploadsDir, { recursive: true });
    fs.writeFileSync(path.join(config.uploadsDir, name), file.buffer);
    return `/uploads/${name}`;
  }
  const { put } = await import('@vercel/blob');
  const blob = await put(`uploads/${name}`, file.buffer, {
    access: 'public',
    contentType: file.mimetype,
    token: config.blobToken,
  });
  return blob.url;
}

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE },
  fileFilter: (_req, file, cb) => {
    const ok = ALLOWED.includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new HttpError(400, 'Only images (jpg, png, webp) or videos (mp4, webm)'), ok);
  },
}).array('files', 10);

// POST /api/admin/upload  → { urls: [...] }
export async function handleUpload(req, res) {
  const urls = [];
  for (const file of req.files ?? []) urls.push(await store(file, fileName('', file.originalname)));
  res.status(201).json({ urls });
}

// ---- customer payment screenshots (public, so images only and small) ----
export const proofUploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Math.min(MAX_FILE, 5 * 1024 * 1024), files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = PROOF_TYPES.includes(path.extname(file.originalname).toLowerCase()) && file.mimetype.startsWith('image/');
    cb(ok ? null : new HttpError(400, 'Please upload a screenshot (jpg, png or webp)'), ok);
  },
}).single('file');

// POST /api/payment-proof  → { url }
export async function handleProofUpload(req, res) {
  if (!req.file) throw new HttpError(400, 'No screenshot received');
  res.status(201).json({ url: await store(req.file, fileName('proof-', req.file.originalname, 6)) });
}

/** Is this a payment screenshot URL that our own upload handler produced? */
export function isProofUrl(url = '') {
  if (/^\/uploads\/proof-[\w.-]+$/.test(url)) return true;
  return /^https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\/uploads\/proof-[\w.-]+$/.test(url);
}
