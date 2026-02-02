import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Management API for Docker controls
      '/api/docker': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      // Proxy API calls to C++ backend REST server
      '/health': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/incidents': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/events': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/stats': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ingest': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // Proxy WebSocket to C++ backend WS server
      '/ws': {
        target: 'ws://localhost:8081',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
  },
});

