import { useLocalStorage } from '@/hooks/useLocalStorage.js'

const STORAGE_KEY = 'dw:saved'

/**
 * Manages saved (favorited) flight offers in localStorage.
 * Each entry: { id, offer, savedAt }
 */
export function useSaved() {
  const [saved, setSaved] = useLocalStorage(STORAGE_KEY, [])

  function saveOffer(flight) {
    setSaved(prev => {
      if (prev.some(s => s.id === flight.id)) return prev
      return [{ id: flight.id, offer: flight, savedAt: new Date().toISOString() }, ...prev]
    })
  }

  function removeOffer(id) {
    setSaved(prev => prev.filter(s => s.id !== id))
  }

  function isSaved(id) {
    return saved.some(s => s.id === id)
  }

  function clearAll() {
    setSaved([])
  }

  return { saved, saveOffer, removeOffer, isSaved, clearAll }
}
