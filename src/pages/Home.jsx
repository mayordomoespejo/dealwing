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
import { SearchIcon, ListIcon, MapPinIcon } from '@/icons'
import styles from './Home.module.css'

export function Home() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useState(null)
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [detailFlight, setDetailFlight] = useState(null)
  const [mobileTab, setMobileTab] = useState('search')
  const mapRef = useRef(null)

  const { data: flights = [], isLoading, error } = useFlightSearch(searchParams)
  const { isSaved, saveOffer, removeOffer } = useSaved()
  const { success, info } = useToast()

  const handleSearch = useCallback(params => {
    setSearchParams(params)
    setSelectedFlight(null)
    setMobileTab('results')
  }, [])

  const handleSelect = useCallback(flight => {
    setSelectedFlight(prev => (prev?.id === flight.id ? null : flight))
  }, [])

  const handleSave = useCallback(
    flight => {
      if (isSaved(flight.id)) {
        removeOffer(flight.id)
        info(t('home.flightRemoved'))
        return
      }
      saveOffer(flight)
      success(t('home.flightSaved'))
    },
    [isSaved, saveOffer, removeOffer, success, info, t]
  )

  useKeyboard('Escape', () => setDetailFlight(null), { enabled: !!detailFlight })

  const resultsBadge = flights.length > 0 ? flights.length : null

  return (
    <div className={styles.page} data-mobile-tab={mobileTab}>
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

      <div className={styles.mapArea}>
        <MapView
          ref={mapRef}
          flights={flights}
          selectedId={selectedFlight?.id}
          searchParams={searchParams}
        />
      </div>

      <FlightDetail
        flight={detailFlight}
        isOpen={!!detailFlight}
        onClose={() => setDetailFlight(null)}
      />

      <nav className={styles.mobileTabBar} aria-label={t('nav.search')}>
        <button
          className={`${styles.mobileTabBtn} ${mobileTab === 'search' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobileTab('search')}
          aria-current={mobileTab === 'search' ? 'page' : undefined}
        >
          <SearchIcon size={20} />
          <span>{t('nav.search')}</span>
        </button>

        <button
          className={`${styles.mobileTabBtn} ${mobileTab === 'results' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobileTab('results')}
          aria-current={mobileTab === 'results' ? 'page' : undefined}
        >
          <ListIcon size={20} />
          <span>{t('nav.results')}</span>
          {resultsBadge !== null && (
            <span className={styles.mobileTabBadge} aria-hidden="true">
              {resultsBadge > 99 ? '99+' : resultsBadge}
            </span>
          )}
        </button>

        <button
          className={`${styles.mobileTabBtn} ${mobileTab === 'map' ? styles.mobileTabActive : ''}`}
          onClick={() => setMobileTab('map')}
          aria-current={mobileTab === 'map' ? 'page' : undefined}
        >
          <MapPinIcon size={20} />
          <span>{t('nav.map')}</span>
        </button>
      </nav>
    </div>
  )
}
