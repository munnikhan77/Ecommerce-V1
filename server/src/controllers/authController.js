import crypto from 'node:crypto';
import { config } from '../config.js';
import { createToken } from '../middleware/auth.js';
import { HttpError } from '../utils/httpError.js';

export function login(req, res) {
  if (!config.adminPassword || !config.tokenSecret) {
    throw new HttpError(503, 'Admin is locked: set ADMIN_PASSWORD and TOKEN_SECRET in the hosting settings');
  }
  const given = Buffer.from(String(req.body.password ?? ''));
  const actual = Buffer.from(config.adminPassword);
  const ok = given.length === actual.length && crypto.timingSafeEqual(given, actual);
  if (!ok) throw new HttpError(401, 'Wrong password');
  res.json({ token: createToken() });
}
