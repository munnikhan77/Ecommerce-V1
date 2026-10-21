import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 5000,
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  tokenSecret: process.env.TOKEN_SECRET || 'dev-secret',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  dbFile: path.join(root, 'data', 'db.json'),
  uploadsDir: path.join(root, 'uploads'),
  clientDist: path.join(root, '..', 'client', 'dist'),
};
