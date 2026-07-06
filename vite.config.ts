import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => ({
  publicDir: false,
  plugins: [
    vue(),
    mode === 'production' && dts({
      entryRoot: 'src',
      include: ['src'],
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@stevebauman/vue-border-beam': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'VueBorderBeam',
      formats: ['es', 'cjs'],
      fileName: format => `index.${format}.js`,
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
}));
