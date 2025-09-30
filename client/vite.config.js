import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ux.kaiten.ru',
        changeOrigin: true,
        secure: false
      },
      '/kaiten-api': {
        target: 'https://ux.kaiten.ru',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/kaiten-api/, '')
      }
    }
  }
})
