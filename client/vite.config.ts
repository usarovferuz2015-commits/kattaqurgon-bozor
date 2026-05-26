import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'remove-module',
      closeBundle() {
        const htmlPath = resolve(__dirname, 'dist', 'index.html');
        try {
          let html = readFileSync(htmlPath, 'utf-8');
          html = html.replace(
            '<script type="module" crossorigin src="',
            '<script src="'
          );
          writeFileSync(htmlPath, html, 'utf-8');
        } catch (e) {
          console.error('Failed to transform index.html:', e);
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