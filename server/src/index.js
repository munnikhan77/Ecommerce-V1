import fs from 'node:fs';
import { config } from './config.js';
import app from './app.js';

fs.mkdirSync(config.uploadsDir, { recursive: true });

app.listen(config.port, () => {
  console.log(`✦ API running on http://localhost:${config.port}`);
});
