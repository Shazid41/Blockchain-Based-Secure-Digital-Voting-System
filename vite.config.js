import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/Blockchain-Based-Secure-Digital-Voting-System/' : '/',
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
