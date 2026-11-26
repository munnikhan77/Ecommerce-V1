// Run `npm run seed` to wipe the database and restore the starting data.
import { db } from './store.js';

await db.reset();
console.log('✔ Database reset with seed data');
