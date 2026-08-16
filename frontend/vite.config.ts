import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  // 프로덕션 빌드는 nginx 서브경로에서 서빙됨.
  // 기본은 /redmine/ 이지만, 2번 인스턴스는 VITE_BASE_PATH=/redmine2/ 로 오버라이드한다.
  base: command === 'build' ? process.env.VITE_BASE_PATH || '/redmine/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
}));
