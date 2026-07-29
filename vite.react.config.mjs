import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  cacheDir: path.resolve(rootDir, '.vite-react-cache'),
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
});
