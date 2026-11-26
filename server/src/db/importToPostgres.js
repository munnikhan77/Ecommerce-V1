// One-time copy of the laptop store (data/db.json) into the online Postgres database.
//   1. `npx vercel env pull .env.local` in the project root (gets DATABASE_URL)
//   2. `npm run db:import`
// Products, categories and settings are copied. Orders on the laptop are test orders, so they are not.
// WARNING: this replaces whatever is in the online database.
import fs from 'node:fs';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: new URL('../../../.env.local', import.meta.url).pathname });

const { config } = await import('../config.js');
config.databaseUrl ||= process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
if (!config.databaseUrl) {
  console.error('✖ No DATABASE_URL — run `npx vercel env pull .env.local` in the project root first.');
  process.exit(1);
}

const { writeAll } = await import('./store.js');
const local = JSON.parse(fs.readFileSync(config.dbFile, 'utf8'));
await writeAll({ categories: local.categories, products: local.products, orders: [], settings: local.settings });
console.log(`✔ Copied ${local.products.length} products, ${local.categories.length} categories and the settings to Postgres`);
