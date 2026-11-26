import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, /api and /uploads are forwarded to the Node server
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // also reachable from a phone on the same Wi-Fi (http://<laptop-ip>:5173)
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
