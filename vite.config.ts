import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Hỗ trợ triển khai linh hoạt trên GitHub Pages, Vercel, Netlify
  server: {
    port: 5173,
    open: false
  }
});
