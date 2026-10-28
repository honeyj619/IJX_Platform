import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { prototypeRequirementsPlugin } from './tools/requirements/vite-plugin.mjs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE || '/',
  cacheDir: path.resolve(rootDir, '.vite-react-cache'),
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    prototypeRequirementsPlugin(rootDir),
    react({
      babel: {
        plugins: command === 'serve' ? ['babel-plugin-react-dev-locator'] : [],
      },
    }),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
}));
