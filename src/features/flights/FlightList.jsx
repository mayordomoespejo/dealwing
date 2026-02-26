import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { FlightCard } from './FlightCard.jsx'
import { FlightCardSkeleton } from '@/components/ui/Skeleton.jsx'
import { computePriceStats } from './dealScore.js'
import { formatPrice } from '@/lib/formatters.js'
import styles from './FlightList.module.css'

const SORT_FNS = {
  price: (a, b) => a.price - b.price,
  duration: (a, b) => a.totalDurationMin - b.totalDurationMin,
  dealScore: (a, b) => b.dealScore - a.dealScore,
}

/**
 * @param {object[]} flights       - all domain flight offers
 * @param {object}   filters       - { maxPrice, maxStops, airlines }
 * @param {string}   sortBy        - 'price' | 'duration' | 'dealScore'
 * @param {boolean}  isLoading
 * @param {object}   error
 * @param {string}   selectedId    - currently selected flight id
 * @param {Function} onSelect      - (flight) => void
 * @param {Function} onShowDetail  - (flight) => void
 * @param {Function} onSave
 * @param {Function} isSaved       - (flight) => boolean
 */
export function FlightList({
  flights,
  filters,
  sortBy,
  isLoading,
  error,
  selectedId,
  onSelect,
  onShowDetail,
  onSave,
  isSaved,
  searchParams,
}) {
  const filteredAndSorted = useMemo(() => {
    if (!flights?.length) return []

    let result = [...flights]

    // Filter by max price
    if (filters.maxPrice) {
      result = result.filter(f => f.price <= filters.maxPrice)
    }

    // Filter by max stops
    if (filters.maxStops !== undefined && filters.maxStops !== 99) {
      result = result.filter(f => f.stops <= filters.maxStops)
    }

    // Filter by selected airlines
    if (filters.airlines?.length) {
      result = result.filter(f => f.airlines.some(a => filters.airlines.includes(a)))
    }

    // Sort
    const sortFn = SORT_FNS[sortBy] ?? SORT_FNS.price
    result.sort(sortFn)

    return result
  }, [flights, filters, sortBy])

  const stats = useMemo(() => computePriceStats(filteredAndSorted), [filteredAndSorted])

  // Loading state
  if (isLoading) {
    return (
      <div className={styles.list}>
        <div className={styles.listHeader}>
          <div className={styles.skeletonCount} />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>✈️</div>
        <h3 className={styles.emptyTitle}>Something went wrong</h3>
        <p className={styles.emptyText}>
          {error.message ?? 'Failed to load flights. Please try again.'}
        </p>
      </div>
    )
  }

  // Empty state — no search yet
  if (!searchParams) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🗺️</div>
        <h3 className={styles.emptyTitle}>Search for flights</h3>
        <p className={styles.emptyText}>
          Enter your origin and dates above to discover great deals.
          <br />
          <span className={styles.hint}>
            Pro tip: press <kbd>/</kbd> to focus the search.
          </span>
        </p>
      </div>
    )
  }

  // No results
  if (!filteredAndSorted.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>No flights found</h3>
        <p className={styles.emptyText}>Try adjusting your filters or dates.</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {/* Header with stats */}
      <div className={styles.listHeader}>
        <span className={styles.resultCount}>
          {filteredAndSorted.length} {filteredAndSorted.length === 1 ? 'flight' : 'flights'}
          {flights.length !== filteredAndSorted.length && ` (of ${flights.length})`}
        </span>
        {filteredAndSorted.length > 0 && (
          <div className={styles.priceInsights}>
            <span className={styles.insightItem}>
              <span className={styles.insightLabel}>from</span>
              <span className={styles.insightValue}>
                {formatPrice(stats.min, flights[0]?.currency)}
              </span>
            </span>
            <span className={styles.insightDivider}>·</span>
            <span className={styles.insightItem}>
              <span className={styles.insightLabel}>avg</span>
              <span className={styles.insightValue}>
                {formatPrice(stats.mean, flights[0]?.currency)}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Flight cards */}
      <AnimatePresence mode="popLayout" initial={false}>
        {filteredAndSorted.map(flight => (
          <FlightCard
            key={flight.id}
            flight={flight}
            isSelected={flight.id === selectedId}
            onSelect={onSelect}
            onShowDetail={onShowDetail}
            onSave={onSave}
            isSaved={isSaved?.(flight)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
