import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(),
    {
      name: 'fix-script-type',
      closeBundle() {
        const htmlPath = resolve(__dirname, 'dist', 'index.html');
        try {
          let html = readFileSync(htmlPath, 'utf-8');
          html = html.replace('<script type="module" crossorigin>', '<script>');
          writeFileSync(htmlPath, html, 'utf-8');
        } catch (e) {
          console.error('Failed:', e);
        }
      },
    },
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,

    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});