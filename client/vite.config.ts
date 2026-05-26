import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import path from 'path';

// Custom plugin to strip type="module" and force the legacy SystemJS build
const forceLegacyPlugin = () => {
  return {
    name: 'force-legacy',
    enforce: 'post' as const,
    transformIndexHtml(html: string) {
      // 1. Remove all modulepreload link tags
      let cleanHtml = html.replace(/<link rel="modulepreload"[^>]*>/g, '');
      
      // 2. Remove the modern script tags that load ESM (type="module")
      cleanHtml = cleanHtml.replace(/<script type="module"[^>]*>([\s\S]*?)<\/script>/g, '');
      cleanHtml = cleanHtml.replace(/<script type="module" src="[^"]+"><\/script>/g, '');
      
      // 3. Remove "nomodule" attributes from remaining scripts
      // e.g. <script nomodule src="..."> becomes <script src="...">
      cleanHtml = cleanHtml.replace(/<script nomodule/g, '<script');
      
      return cleanHtml;
    }
  };
};

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      renderModernTargets: false, // Do not generate modern polyfills to keep build cleaner
    }),
    forceLegacyPlugin(),
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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['react-icons'],
        },
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
