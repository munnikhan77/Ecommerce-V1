/**
 * Tiny JSON-file database.
 * Every collection is an array inside data/db.json.
 * Later you can swap this file for MongoDB/Postgres — the controllers
 * only use the functions exported here.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { config } from '../config.js';
import { seedData } from './seedData.js';

let data = null;

function load() {
  if (data) return data;
  if (!fs.existsSync(config.dbFile)) {
    fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
    data = structuredClone(seedData);
    save();
  } else {
    data = JSON.parse(fs.readFileSync(config.dbFile, 'utf8'));
  }
  return data;
}

function save() {
  // write to a temp file first so a crash never leaves a half-written db
  const tmp = `${config.dbFile}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, config.dbFile);
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
    load()[collection].push(record);
    save();
    return record;
  },

  update(collection, id, changes) {
    const list = this.all(collection);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return null;
    list[index] = { ...list[index], ...changes, id, updatedAt: new Date().toISOString() };
    save();
    return list[index];
  },

  remove(collection, id) {
    const list = this.all(collection);
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return false;
    list.splice(index, 1);
    save();
    return true;
  },

  // settings is a single object, not a list
  getSettings() {
    return load().settings;
  },

  updateSettings(changes) {
    load().settings = { ...data.settings, ...changes };
    save();
    return data.settings;
  },

  reset() {
    data = structuredClone(seedData);
    save();
  },
};
