import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // Strictly bound to localhost - never exposed to all-interfaces or LAN
    port: 60135,
    strictPort: true, // Fail-fast: exit immediately if port 60135 is unavailable
  },
  preview: {
    host: '127.0.0.1', // Strictly local loopback preview
    port: 60135,
    strictPort: true,
  },
})

