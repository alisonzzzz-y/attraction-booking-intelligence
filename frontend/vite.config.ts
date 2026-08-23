import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const backendTarget =
  process.env.BACKEND_PROXY_TARGET ?? 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/actuator': backendTarget,
      '/api': backendTarget,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    css: true,
  },
})
