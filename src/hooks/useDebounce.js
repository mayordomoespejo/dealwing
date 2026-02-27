import { useState, useEffect } from 'react'

/**
 * Debounces a value by the given delay in milliseconds.
 * The returned value only updates after `delay` ms have passed without
 * the input changing — useful for deferring expensive operations like API calls.
 *
 * @template T
 * @param {T}      value - the value to debounce
 * @param {number} [delay=300] - debounce delay in milliseconds
 * @returns {T} the debounced value
 *
 * @example
 * const debouncedQuery = useDebounce(searchInput, 280)
 * // debouncedQuery only updates 280 ms after the user stops typing
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
