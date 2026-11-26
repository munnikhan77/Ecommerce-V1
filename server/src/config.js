import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 5000,
  // on Vercel there are no defaults: admin stays locked until both are set in the project's env vars
  adminPassword: process.env.ADMIN_PASSWORD || (process.env.VERCEL ? '' : 'admin123'),
  tokenSecret: process.env.TOKEN_SECRET || (process.env.VERCEL ? '' : 'dev-secret'),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // set on Vercel by the Neon integration; empty on the laptop → JSON file
  databaseUrl: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
  // set on Vercel when a Blob store is connected; empty on the laptop → uploads folder
  blobToken: process.env.BLOB_READ_WRITE_TOKEN || '',
  dbFile: path.join(root, 'data', 'db.json'),
  uploadsDir: path.join(root, 'uploads'),
  clientDist: path.join(root, '..', 'client', 'dist'),
};
