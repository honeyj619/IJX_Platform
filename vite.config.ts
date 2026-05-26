import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    tsconfigPaths()
  ],
})
