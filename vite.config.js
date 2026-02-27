import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite plugin that handles /api/* routes during local development.
 * Loads the Vercel serverless function handlers via SSR module loading,
 * so process.env variables (RAPIDAPI_KEY, DUFFEL_ACCESS_TOKEN) work normally.
 * In production these remain Vercel serverless functions — no change needed.
 */
function apiPlugin() {
  return {
    name: 'api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost')
        if (!url.pathname.startsWith('/api/')) return next()

        // Populate req.query (like Express / Vercel)
        req.query = Object.fromEntries(url.searchParams)

        // Parse JSON body for POST/PUT/PATCH
        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
          const chunks = []
          for await (const chunk of req) chunks.push(chunk)
          try {
            req.body = JSON.parse(Buffer.concat(chunks).toString())
          } catch {
            req.body = {}
          }
        }

        // Add res.status() and res.json() shims (like Express / Vercel)
        res.status = code => {
          res.statusCode = code
          return res
        }
        res.json = data => {
          if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        }

        const route = url.pathname.slice('/api/'.length)
        try {
          const mod = await server.ssrLoadModule(`/api/${route}.js`)
          if (typeof mod.default !== 'function') return next()
          await mod.default(req, res)
        } catch (err) {
          console.error(`[api/${route}]`, err.message)
          res.statusCode = 500
          res.end(JSON.stringify({ error: err.message }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load ALL env vars (including non-VITE_* ones like RAPIDAPI_KEY, DUFFEL_ACCESS_TOKEN)
  // into process.env so the api/ handlers can read them via server.ssrLoadModule.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), apiPlugin()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
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
  }
})
