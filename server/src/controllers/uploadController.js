import path from 'node:path';
import crypto from 'node:crypto';
import multer from 'multer';
import { config } from '../config.js';
import { HttpError } from '../utils/httpError.js';

const ALLOWED = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.mp4', '.webm'];

const storage = multer.diskStorage({
  destination: config.uploadsDir,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB (videos)
  fileFilter: (_req, file, cb) => {
    const ok = ALLOWED.includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new HttpError(400, 'Only images (jpg, png, webp) or videos (mp4, webm)'), ok);
  },
}).array('files', 10);

// POST /api/upload  → { urls: ['/uploads/xxx.jpg', ...] }
export function handleUpload(req, res) {
  res.status(201).json({ urls: (req.files ?? []).map((f) => `/uploads/${f.filename}`) });
}

// ---- customer payment screenshots (public, so images only and small) ----
const PROOF_TYPES = ['.jpg', '.jpeg', '.png', '.webp'];

export const proofUploadMiddleware = multer({
  storage: multer.diskStorage({
    destination: config.uploadsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `proof-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = PROOF_TYPES.includes(path.extname(file.originalname).toLowerCase()) && file.mimetype.startsWith('image/');
    cb(ok ? null : new HttpError(400, 'Please upload a screenshot (jpg, png or webp)'), ok);
  },
}).single('file');

// POST /api/payment-proof  → { url: '/uploads/proof-xxx.jpg' }
export function handleProofUpload(req, res) {
  if (!req.file) throw new HttpError(400, 'No screenshot received');
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
}
