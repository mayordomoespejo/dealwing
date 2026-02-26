import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SearchForm } from '@/features/search/SearchForm.jsx'
import { FlightList } from '@/features/flights/FlightList.jsx'
import { FlightFilters } from '@/features/flights/FlightFilters.jsx'
import { FlightDetail } from '@/features/flights/FlightDetail.jsx'
import { MapView } from '@/features/map/MapView.jsx'
import { useFlightSearch } from '@/features/flights/hooks.js'
import { useSaved } from '@/features/saved/useSaved.js'
import { useToast } from '@/components/ui/Toast.jsx'
import { useKeyboard } from '@/hooks/useKeyboard.js'
import styles from './Home.module.css'

const DEFAULT_FILTERS = { maxPrice: null, maxStops: 99, airlines: [] }

export function Home() {
  const [searchParams, setSearchParams] = useState(null)
  const [selectedFlight, setSelectedFlight] = useState(null)
  const [detailFlight, setDetailFlight] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sortBy, setSortBy] = useState('price')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { data: flights = [], isLoading, error } = useFlightSearch(searchParams)
  const { isSaved, saveOffer, removeOffer } = useSaved()
  const { success, info } = useToast()

  const handleSearch = useCallback(params => {
    setSearchParams(params)
    setSelectedFlight(null)
    setFilters(DEFAULT_FILTERS)
  }, [])

  const handleSelect = useCallback(flight => {
    setSelectedFlight(prev => (prev?.id === flight.id ? null : flight))
  }, [])

  const handleSave = useCallback(
    flight => {
      if (isSaved(flight.id)) {
        removeOffer(flight.id)
        info('Flight removed from saved')
      } else {
        saveOffer(flight)
        success('Flight saved!')
      }
    },
    [isSaved, saveOffer, removeOffer, success, info]
  )

  // Keyboard: Escape closes detail modal
  useKeyboard('Escape', () => setDetailFlight(null), { enabled: !!detailFlight })

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <motion.aside
        className={styles.sidebar}
        animate={{
          width: sidebarOpen ? 'var(--sidebar-width)' : '0px',
          opacity: sidebarOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <div className={styles.sidebarInner}>
          {/* Search form */}
          <section className={styles.searchSection}>
            <SearchForm onSearch={handleSearch} loading={isLoading} />
          </section>

          {/* Filters (only show when there are results) */}
          <AnimatePresence>
            {flights.length > 0 && (
              <motion.section
                key="filters"
                className={styles.filtersSection}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <FlightFilters
                  flights={flights}
                  filters={filters}
                  onChange={setFilters}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              </motion.section>
            )}
          </AnimatePresence>

          {/* Results list */}
          <section className={styles.resultsSection}>
            <FlightList
              flights={flights}
              filters={filters}
              sortBy={sortBy}
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
      </motion.aside>

      {/* Sidebar toggle */}
      <button
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen(o => !o)}
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.25s',
          }}
          aria-hidden="true"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Map */}
      <div className={styles.mapArea}>
        <MapView
          flights={flights}
          selectedId={selectedFlight?.id}
          onSelect={handleSelect}
          searchParams={searchParams}
        />

        {/* Map overlay: selected flight quick info */}
        <AnimatePresence>
          {selectedFlight && (
            <motion.div
              className={styles.selectedBanner}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.bannerRoute}>
                <strong>{selectedFlight.origin.iata}</strong>
                {' → '}
                <strong>{selectedFlight.destination.iata}</strong>
                <span className={styles.bannerCity}>{selectedFlight.destination.city}</span>
              </div>
              <div className={styles.bannerMeta}>
                <span className={styles.bannerPrice}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: selectedFlight.currency,
                    maximumFractionDigits: 0,
                  }).format(selectedFlight.price)}
                </span>
                <button
                  className={styles.bannerDetail}
                  onClick={() => setDetailFlight(selectedFlight)}
                >
                  View details →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
