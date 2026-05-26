import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fix-script-tag',
      closeBundle() {
        const htmlPath = resolve(__dirname, 'dist', 'index.html');
        try {
          let html = readFileSync(htmlPath, 'utf-8');
          html = html.replace('<script type="module" crossorigin src="', '<script src="');
          html = html.replace('<script type="module" crossorigin>', '<script>');
          writeFileSync(htmlPath, html, 'utf-8');
        } catch (e) {
          console.error('Failed:', e);
        }
      },
    },
  ],
  build: {
    target: 'es2015',
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});