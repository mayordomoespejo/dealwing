import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'dw-theme'

/** @type {React.Context<{theme: string, setTheme: Function}|null>} */
const ThemeContext = createContext(null)

function getOSTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Provides theme state ('light' | 'dark') and applies data-theme to <html>.
 * - Defaults to the OS preference if no saved choice
 * - Persists user choice to localStorage under 'dw-theme'
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE_KEY) ?? getOSTheme())

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const setTheme = newTheme => {
    setThemeState(newTheme)
    localStorage.setItem(STORAGE_KEY, newTheme)
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
