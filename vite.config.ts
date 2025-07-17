import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/auth/, '/auth')
      },
      '/api/surveys': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/surveys/, '/surveys')
      },
      '/api/dashboard': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/dashboard/, '/dashboard')
      },
      '/api/templates': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/templates/, '/templates')
      },
      '/api/responses': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/responses/, '/responses')
      },
      '/api/analysis': {
        target: 'http://localhost:8003',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/analysis/, '/analysis')
      }
    }
  }
})