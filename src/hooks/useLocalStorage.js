import { useState, useCallback } from 'react'

/**
 * useState-compatible hook that persists state to localStorage.
 * @param {string} key         - localStorage key
 * @param {*}      initialValue - default value if nothing is stored yet
 */
export function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    value => {
      try {
        const toStore = value instanceof Function ? value(stored) : value
        setStored(toStore)
        window.localStorage.setItem(key, JSON.stringify(toStore))
      } catch {
        return
      }
    },
    [key, stored]
  )

  const remove = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStored(initialValue)
    } catch {
      return
    }
  }, [key, initialValue])

  return [stored, setValue, remove]
}
