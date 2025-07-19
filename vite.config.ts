import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { ProxyOptions } from 'vite'

// Mapea cada servicio a su puerto correspondiente
const services: Record<string, number> = {
  auth: 8000,
  surveys: 8001,
  dashboard: 8001,
  templates: 8001,
  responses: 8002,
  analysis: 8003,
}

// Función para crear dinámicamente la configuración de proxy
function createProxy(): Record<string, ProxyOptions> {
  return Object.fromEntries(
    Object.entries(services).map(([name, port]) => {
      return [
        `/api/${name}`,
        {
          target: `http://localhost:${port}`,
          changeOrigin: true,
          rewrite: path => path.replace(new RegExp(`^/api/${name}`), `/${name}/`),
          // Mantiene los headers, incluyendo Authorization
          secure: false,
        } as ProxyOptions,
      ]
    })
  )
  
}

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: createProxy(),
  },
})
