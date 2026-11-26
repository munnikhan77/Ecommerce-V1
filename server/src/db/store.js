/**
 * The store's database, with one API and two backends:
 *
 *  - On your laptop (no DATABASE_URL): a JSON file, data/db.json.
 *  - On Vercel (DATABASE_URL set): Postgres (Neon). Each product, order, category
 *    and the settings is one row in a `records` table. At the start of every API
 *    request the rows are read into memory; whatever the request changed is written
 *    back before the response goes out (see `db.middleware`).
 *
 * Controllers only use the `db` object below, so they work the same either way.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import { config } from '../config.js';
import { seedData } from './seedData.js';

export const usingPostgres = Boolean(config.databaseUrl);
const COLLECTIONS = ['categories', 'products', 'orders'];

/* ------------------------------------------------------------------ */
/*  JSON file (local)                                                 */
/* ------------------------------------------------------------------ */
let fileData = null;

function loadFile() {
  if (fileData) return fileData;
  if (!fs.existsSync(config.dbFile)) {
    fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
    fileData = structuredClone(seedData);
    saveFile();
  } else {
    fileData = JSON.parse(fs.readFileSync(config.dbFile, 'utf8'));
  }
  return fileData;
}

function saveFile() {
  // write to a temp file first so a crash never leaves a half-written db
  const tmp = `${config.dbFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(fileData, null, 2));
  fs.renameSync(tmp, config.dbFile);
}

/* ------------------------------------------------------------------ */
/*  Postgres (Vercel)                                                 */
/* ------------------------------------------------------------------ */
// one request = one snapshot; concurrent requests never share it
const requestState = new AsyncLocalStorage();
let sql = null;
let tableReady = null;

async function getSql() {
  if (!sql) {
    const { neon } = await import('@neondatabase/serverless');
    sql = neon(config.databaseUrl);
  }
  tableReady ??= sql
    .query(
      `CREATE TABLE IF NOT EXISTS records (
         collection text NOT NULL,
         id text NOT NULL,
         data jsonb NOT NULL,
         PRIMARY KEY (collection, id)
       )`,
    )
    .catch((err) => {
      tableReady = null;
      throw err;
    });
  await tableReady;
  return sql;
}

async function readAll() {
  const q = await getSql();
  const rows = await q.query('SELECT collection, id, data FROM records');
  const data = { categories: [], products: [], orders: [], settings: null };
  for (const row of rows) {
    if (row.collection === 'settings') data.settings = row.data;
    else data[row.collection]?.push(row.data);
  }
  // keep the same order as the JSON file had (newest products first, orders by date)
  data.categories.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  data.products.sort((a, b) => (a._pos ?? 0) - (b._pos ?? 0));
  data.orders.sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  if (!data.settings) data.settings = structuredClone(seedData.settings);
  return data;
}

/** Write a whole store (used by the one-time import and by `npm run seed`). */
export async function writeAll(data) {
  const q = await getSql();
  const statements = [q.query('DELETE FROM records')];
  for (const name of COLLECTIONS) {
    (data[name] ?? []).forEach((doc, i) => {
      const row = name === 'products' ? { ...doc, _pos: i } : doc;
      statements.push(
        q.query('INSERT INTO records (collection, id, data) VALUES ($1, $2, $3)', [name, doc.id, JSON.stringify(row)]),
      );
    });
  }
  statements.push(
    q.query('INSERT INTO records (collection, id, data) VALUES ($1, $2, $3)', ['settings', 'main', JSON.stringify(data.settings)]),
  );
  await q.transaction(statements);
}

async function flush(state) {
  if (!state.changed.size && !state.removed.size) return;
  const q = await getSql();
  const statements = [];
  for (const key of state.removed) {
    const [collection, id] = key.split('\u0000');
    statements.push(q.query('DELETE FROM records WHERE collection = $1 AND id = $2', [collection, id]));
  }
  for (const [key, doc] of state.changed) {
    const [collection, id] = key.split('\u0000');
    statements.push(
      q.query(
        `INSERT INTO records (collection, id, data) VALUES ($1, $2, $3)
         ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data`,
        [collection, id, JSON.stringify(doc)],
      ),
    );
  }
  await q.transaction(statements);
  state.changed.clear();
  state.removed.clear();
}

/* ------------------------------------------------------------------ */
/*  shared                                                            */
/* ------------------------------------------------------------------ */
function load() {
  if (!usingPostgres) return loadFile();
  const state = requestState.getStore();
  if (!state) throw new Error('Database used outside a request');
  return state.data;
}

// remember what changed so only those rows are written back
function touched(collection, doc) {
  if (!usingPostgres) return saveFile();
  const state = requestState.getStore();
  const key = `${collection}\u0000${doc.id}`;
  state.removed.delete(key);
  state.changed.set(key, doc);
}

function dropped(collection, id) {
  if (!usingPostgres) return saveFile();
  const state = requestState.getStore();
  const key = `${collection}\u0000${id}`;
  state.changed.delete(key);
  state.removed.add(key);
}

export const newId = () => crypto.randomUUID();

export const db = {
  all(collection) {
    return load()[collection] ?? [];
  },

  find(collection, predicate) {
    return this.all(collection).find(predicate);
  },

  insert(collection, doc) {
    const now = new Date().toISOString();
    const record = { id: newId(), createdAt: now, updatedAt: now, ...doc };
    const list = load()[collection];
    // products keep their list position in Postgres too
    if (collection === 'products' && usingPostgres) record._pos = list.reduce((m, p) => Math.max(m, p._pos ?? 0), 0) + 1;
    list.push(record);
    touched(collection, record);
    return record;
  },

  update(collection, id, changes) {
    const list = this.all(collection);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...changes, id, updatedAt: new Date().toISOString() };
    touched(collection, list[index]);
    return list[index];
  },

  remove(collection, id) {
    const list = this.all(collection);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    dropped(collection, id);
    return true;
  },

  // settings is a single object, not a list
  getSettings() {
    return load().settings;
  },

  updateSettings(changes) {
    const data = load();
    data.settings = { ...data.settings, ...changes };
    touched('settings', { ...data.settings, id: 'main' });
    return data.settings;
  },

  reset() {
    if (usingPostgres) return writeAll(structuredClone(seedData));
    fileData = structuredClone(seedData);
    saveFile();
  },

  /**
   * Express middleware (Postgres only): load the store for this request, and
   * hold the response until the request's changes are safely written.
   * If saving fails the customer gets an error instead of a false "done".
   */
  middleware() {
    return async (req, res, next) => {
      if (!usingPostgres) return next();
      let state;
      try {
        state = { data: await readAll(), changed: new Map(), removed: new Set() };
      } catch (err) {
        return next(err);
      }

      const send = res.send.bind(res);
      const end = res.end.bind(res);
      let held = false;
      const hold = (original) => (...args) => {
        if (held || (!state.changed.size && !state.removed.size)) return original(...args);
        held = true;
        flush(state).then(
          () => original(...args),
          (err) => {
            console.error('Saving to the database failed:', err);
            res.removeHeader('Content-Length');
            res.status(500).type('json');
            end(JSON.stringify({ message: 'Could not save — please try again' }));
          },
        );
        return res;
      };
      res.send = hold(send);
      res.end = hold(end);

      requestState.run(state, next);
    };
  },
};
