import crypto from 'node:crypto';
import { config } from '../config.js';
import { createToken } from '../middleware/auth.js';
import { HttpError } from '../utils/httpError.js';

export function login(req, res) {
  const given = Buffer.from(String(req.body.password ?? ''));
  const actual = Buffer.from(config.adminPassword);
  const ok = given.length === actual.length && crypto.timingSafeEqual(given, actual);
  if (!ok) throw new HttpError(401, 'Wrong password');
  res.json({ token: createToken() });
}
