import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_ENV__: JSON.stringify({
      VITE_API_BASE_URL: process.env.VITE_API_BASE_URL || 'https://order-management-raftlabs-assignment.onrender.com/api',
    }),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://order-management-raftlabs-assignment.onrender.com/api',
        changeOrigin: true,
      },
    },
  },
})
