import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { SearchForm } from '@/features/search/SearchForm.jsx'
import { FlightList } from '@/features/flights/FlightList.jsx'
import { FlightDetail } from '@/features/flights/FlightDetail.jsx'
import { MapView } from '@/features/map/MapView.jsx'
import { useFlightSearch } from '@/features/flights/hooks.js'
import { useSaved } from '@/features/saved/useSaved.js'
import { useToast } from '@/components/ui/Toast.jsx'
import { useKeyboard } from '@/hooks/useKeyboard.js'
import styles from './Home.module.css'

export function Home() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useState(null)
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [detailFlight, setDetailFlight] = useState(null)
  const mapRef = useRef(null)

  const { data: flights = [], isLoading, error } = useFlightSearch(searchParams)
  const { isSaved, saveOffer, removeOffer } = useSaved()
  const { success, info } = useToast()

  const handleSearch = useCallback(params => {
    setSearchParams(params)
    setSelectedFlight(null)
  }, [])

  const handleSelect = useCallback(flight => {
    setSelectedFlight(prev => (prev?.id === flight.id ? null : flight))
  }, [])

  const handleSave = useCallback(
    flight => {
      if (isSaved(flight.id)) {
        removeOffer(flight.id)
        info(t('home.flightRemoved'))
      } else {
        saveOffer(flight)
        success(t('home.flightSaved'))
      }
    },
    [isSaved, saveOffer, removeOffer, success, info, t]
  )

  // Keyboard: Escape closes detail modal
  useKeyboard('Escape', () => setDetailFlight(null), { enabled: !!detailFlight })

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <section className={styles.searchSection}>
            <SearchForm onSearch={handleSearch} loading={isLoading} />
          </section>

          <section className={styles.resultsSection}>
            <FlightList
              flights={flights}
              isLoading={isLoading}
              error={error}
              selectedId={selectedFlight?.id}
              onSelect={handleSelect}
              onShowDetail={setDetailFlight}
              onSave={handleSave}
              isSaved={f => isSaved(f.id)}
              searchParams={searchParams}
            />
          </section>
        </div>
      </aside>

      {/* Map */}
      <div className={styles.mapArea}>
        <MapView
          ref={mapRef}
          flights={flights}
          selectedId={selectedFlight?.id}
          searchParams={searchParams}
        />
      </div>

      {/* Flight detail modal */}
      <FlightDetail
        flight={detailFlight}
        isOpen={!!detailFlight}
        onClose={() => setDetailFlight(null)}
      />
    </div>
  )
}
