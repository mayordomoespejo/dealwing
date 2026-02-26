import { useLocalStorage } from '@/hooks/useLocalStorage.js'

const MAX_HISTORY = 8
const STORAGE_KEY = 'dw:searchHistory'

/**
 * Manages recent search history in localStorage.
 * Each entry: { id, origin, destination, departureDate, returnDate, adults, searchedAt }
 */
export function useSearchHistory() {
  const [history, setHistory] = useLocalStorage(STORAGE_KEY, [])

  function addSearch(params) {
    const entry = {
      id: Date.now(),
      ...params,
      searchedAt: new Date().toISOString(),
    }
    setHistory(prev => {
      // Remove duplicate (same origin+destination+date)
      const filtered = prev.filter(
        h =>
          !(
            h.origin === params.origin &&
            h.destination === params.destination &&
            h.departureDate === params.departureDate
          )
      )
      return [entry, ...filtered].slice(0, MAX_HISTORY)
    })
  }

  function clearHistory() {
    setHistory([])
  }

  function removeEntry(id) {
    setHistory(prev => prev.filter(h => h.id !== id))
  }

  return { history, addSearch, clearHistory, removeEntry }
}
