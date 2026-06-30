import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // 프로덕션 빌드는 nginx 서브경로(/redmine/)에서 서빙됨
  base: command === 'build' ? '/redmine/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
}));
