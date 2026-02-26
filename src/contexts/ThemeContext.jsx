import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'dw-theme'

/** @type {React.Context<{theme: string, resolvedTheme: string, setTheme: Function}|null>} */
const ThemeContext = createContext(null)

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Provides theme state (system / light / dark) and applies data-theme to <html>.
 * - Defaults to 'system' (follows OS preference)
 * - Persists choice to localStorage under 'dw-theme'
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE_KEY) ?? 'system')

  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme

  // Apply data-theme attribute to <html> whenever resolved theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  // When theme === 'system', keep data-theme in sync with OS changes
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = e => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light')
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const setTheme = newTheme => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
