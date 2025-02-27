import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: true // needed for Railway
  },
  define: {
    'process.env': process.env,
  },
}); 