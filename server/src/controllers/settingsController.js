import { db } from '../db/store.js';

export function getSettings(_req, res) {
  res.json(db.getSettings());
}

export function updateSettings(req, res) {
  res.json(db.updateSettings(req.body));
}
