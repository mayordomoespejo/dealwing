import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import reactPlugin from 'eslint-plugin-react'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),

  // ── Frontend source ──────────────────────────────────────────────────────
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { react: reactPlugin },
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // Track JSX namespace variables (e.g. motion.div) as "used"
      'react/jsx-uses-vars': 'error',
      // react-refresh: allow files that export hooks + components together
      'react-refresh/only-export-components': 'off',
      // Suppress incompatible-library warnings from react-hook-form's watch()
      'react-hooks/incompatible-library': 'off',
    },
  },

  // ── Node files (BFF, config) ─────────────────────────────────────────────
  {
    files: ['api/**/*.js', 'vite.config.js', 'playwright.config.js', 'e2e/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: { ...globals.node, ...globals.browser },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
])
