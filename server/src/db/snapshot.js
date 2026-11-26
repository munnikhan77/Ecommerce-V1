// Run `npm run snapshot` to copy the live store (products, categories, settings — never orders)
// into storeSnapshot.json, so it can be committed to git and becomes the starting data.
import fs from 'node:fs';
import { config } from '../config.js';

const { categories, products, settings } = JSON.parse(fs.readFileSync(config.dbFile, 'utf8'));
fs.writeFileSync(new URL('./storeSnapshot.json', import.meta.url), JSON.stringify({ categories, products, settings }, null, 2));
console.log(`✔ Snapshot saved: ${products.length} products, ${categories.length} categories`);
