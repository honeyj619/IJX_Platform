import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { prototypeRequirementsPlugin } from './tools/requirements/vite-plugin.mjs';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE || '/',
  cacheDir: path.resolve(rootDir, '.vite-react-cache'),
  build: {
    sourcemap: 'hidden',
    // P2：主块经 manualChunks+lazy 已从 1735KB 降至 864KB；剩余为存量同步页面，阈值放宽至 900
    chunkSizeWarningLimit: 900,
    // P2：主块经 manualChunks+lazy 已从 1735KB 降至 864KB；剩余为存量同步页面，阈值放宽至 900
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // P2：拆分大依赖，避免单块超 500KB 警告
        manualChunks: {
          vendor_react: ['react', 'react-dom', 'react-router-dom'],
          vendor_ui: ['lucide-react'],
          vendor_zustand: ['zustand'],
        },
      },
    },
  },
  plugins: [
    prototypeRequirementsPlugin(rootDir),
    react({
      babel: {
        plugins: command === 'serve' ? ['babel-plugin-react-dev-locator'] : [],
      },
    }),
    // 员工端 Vue 原型（src/prototype/**）作为子应用参与同一次构建
    vue(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
}));
