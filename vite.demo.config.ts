import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/vue-border-beam/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@stevebauman/vue-border-beam': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
    },
  },
  build: {
    outDir: 'demo-dist',
    emptyOutDir: true,
  },
});
