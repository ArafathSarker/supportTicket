import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    // Override with `npm run dev -- --port 8080` or VITE_PORT, avoid clashing
    // with other dev servers on this machine.
    port: Number(process.env.VITE_PORT) || 5173,
    strictPort: false, // if busy, vite picks the next free port
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
      },
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
