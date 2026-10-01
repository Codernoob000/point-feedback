import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PointFeedback',
      fileName: (format) => `widget.${format}.js`,
      formats: ['es', 'umd', 'iife']
    },
    rollupOptions: {
      output: {
        extend: true
      }
    }
  },
  server: {
    port: 5174,
    cors: true
  }
});
