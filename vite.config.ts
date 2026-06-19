import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // SSE endpoint must be proxied separately with ws:false so Vite does
      // not attempt a WebSocket upgrade — SSE uses plain HTTP streaming.
      '/api/events': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: false,
      },
      // All other /api calls proxy to the Express backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
