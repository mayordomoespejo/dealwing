import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // Don't proxy Vite module requests (e.g. api/_mock.js imported by the frontend).
        // Only real API calls (no file extension) should be forwarded to the BFF.
        bypass: req => {
          if (/\.(js|ts|jsx|tsx|mjs)(\?|$)/.test(req.url ?? '')) return req.url
        },
      },
    },
  },

  build: {
    chunkSizeWarningLimit: 1100, // MapLibre GL is inherently ~1MB (WebGL library)
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-motion': ['framer-motion'],
          'vendor-map': ['maplibre-gl'],
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: true,
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
    include: ['src/**/*.test.{js,jsx}'],
  },
})
