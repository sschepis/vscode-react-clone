import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

export default defineConfig({
  plugins: [
    react(),
    electron({
      entry: 'src/main.ts',
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});