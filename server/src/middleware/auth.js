/**
 * Very small token auth for the admin panel (no extra packages).
 * Token = base64(payload).signature, signed with TOKEN_SECRET.
 */
import crypto from 'node:crypto';
import { config } from '../config.js';
import { HttpError } from '../utils/httpError.js';

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const sign = (value) => crypto.createHmac('sha256', config.tokenSecret).update(value).digest('base64url');

export function createToken() {
  const payload = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + TOKEN_TTL_MS })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token = '') {
  if (!config.tokenSecret) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
  return exp > Date.now();
}

export function requireAdmin(req, _res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!verifyToken(token)) return next(new HttpError(401, 'Please log in as admin'));
  next();
}
