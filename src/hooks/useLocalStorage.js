import { useState, useCallback } from 'react'

/**
 * useState-compatible hook that persists state to localStorage.
 * Falls back to `initialValue` if the stored item cannot be read or parsed.
 *
 * @param {string} key          - localStorage key
 * @param {*}      initialValue - default value if nothing is stored yet
 * @returns {[*, Function, Function]} [storedValue, setValue, remove]
 */
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch (err) {
      console.warn(`[useLocalStorage] Failed to read "${key}" from localStorage:`, err)
      return initialValue
    }
  })

  const setValue = useCallback(
    value => {
      try {
        const toStore = value instanceof Function ? value(stored) : value
        setStored(toStore)
        window.localStorage.setItem(key, JSON.stringify(toStore))
      } catch (err) {
        console.warn(`[useLocalStorage] Failed to write "${key}" to localStorage:`, err)
      }
    },
    [key, stored]
  )

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStored(initialValue)
    } catch (err) {
      console.warn(`[useLocalStorage] Failed to remove "${key}" from localStorage:`, err)
    }
  }, [key, initialValue])

  return [stored, setValue, remove]
}
