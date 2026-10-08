import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // A fixed port, so e2e.config.ts knows where the app is.
  server: {
    port: 5173,
    strictPort: true,
    // The todo app calls /api/todos; `npm run api` serves it on :3001.
    proxy: { '/api': { target: 'http://localhost:3001', rewrite: (path) => path.replace(/^\/api/, '') } },
  },
});
