import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'remove-module-type',
      closeBundle() {
        const htmlPath = resolve(__dirname, 'dist', 'index.html');
        try {
          let html = readFileSync(htmlPath, 'utf-8');
          html = html.replace('<script type="module" crossorigin>', '<script>');
          writeFileSync(htmlPath, html, 'utf-8');
          console.log('✅ Removed type="module" from script tag');
        } catch (e) {
          console.error('Failed:', e);
        }
      },
    },
  ],
  build: {
    target: 'es2015',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
});