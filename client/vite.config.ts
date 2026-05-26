import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'inline-all',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        const htmlPath = resolve(dist, 'index.html');
        let html = readFileSync(htmlPath, 'utf-8');

        html = html.replace(
          /<script[^>]+src="\/assets\/(.+?\.js)"[^>]*><\/script>/g,
          (_, filename) => {
            const jsPath = resolve(dist, 'assets', filename);
            const jsCode = readFileSync(jsPath, 'utf-8');
            return `<script>${jsCode}</script>`;
          }
        );

        writeFileSync(htmlPath, html, 'utf-8');
        console.log('✅ All JS inlined into index.html');
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