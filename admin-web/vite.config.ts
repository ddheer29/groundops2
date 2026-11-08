import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@groundops/contracts': path.resolve(__dirname, '../shared/contracts/src'),
    },
  },
  server: {
    port: 3000,
  },
});
