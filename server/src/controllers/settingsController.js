import { db } from '../db/store.js';
import { withContentDefaults } from '../db/contentDefaults.js';

export function getSettings(_req, res) {
  res.json(withContentDefaults(db.getSettings()));
}

export function updateSettings(req, res) {
  res.json(withContentDefaults(db.updateSettings(req.body)));
}
