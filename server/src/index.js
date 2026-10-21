import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

fs.mkdirSync(config.uploadsDir, { recursive: true });

const app = express();

app.use(cors({ origin: config.clientUrl }));
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(config.uploadsDir, { maxAge: '7d' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api', routes);
app.use('/api', notFound);

// In production (after `npm run build`) the same server also serves the React site
if (fs.existsSync(config.clientDist)) {
  app.use(express.static(config.clientDist));
  app.get('*', (_req, res) => res.sendFile(path.join(config.clientDist, 'index.html')));
}

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`✦ API running on http://localhost:${config.port}`);
});
