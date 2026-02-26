import styles from './FlightFilters.module.css'
import { computePriceStats } from './dealScore.js'
import { formatPrice } from '@/lib/formatters.js'

/**
 * Sidebar filters for flight results.
 *
 * @param {object[]} flights   - all (unfiltered) results
 * @param {object}   filters   - current filter state
 * @param {Function} onChange  - (newFilters) => void
 * @param {string}   sortBy    - 'price' | 'duration' | 'dealScore'
 * @param {Function} onSortChange
 */
export function FlightFilters({ flights, filters, onChange, sortBy, onSortChange }) {
  if (!flights.length) return null

  const stats = computePriceStats(flights)
  const currency = flights[0]?.currency ?? 'EUR'
  const allAirlines = [...new Set(flights.flatMap(f => f.airlines))]
  const allAirlineNames = [...new Set(flights.flatMap(f => f.airlineNames))]

  function update(key, value) {
    onChange({ ...filters, [key]: value })
  }

  function toggleAirline(code) {
    const current = filters.airlines ?? []
    const next = current.includes(code) ? current.filter(a => a !== code) : [...current, code]
    update('airlines', next)
  }

  return (
    <div className={styles.panel}>
      {/* Sort */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Sort by</h3>
        <div className={styles.sortBtns}>
          {[
            { key: 'price', label: 'Price' },
            { key: 'duration', label: 'Duration' },
            { key: 'dealScore', label: 'Best deal' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.sortBtn} ${sortBy === key ? styles.sortActive : ''}`}
              onClick={() => onSortChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className={styles.section}>
        <div className={styles.sectionHeaderRow}>
          <h3 className={styles.sectionTitle}>Max price</h3>
          <span className={styles.sectionValue}>
            {filters.maxPrice ? formatPrice(filters.maxPrice, currency) : 'Any'}
          </span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={Math.round(stats.min)}
          max={Math.round(stats.max)}
          step={5}
          value={filters.maxPrice ?? Math.round(stats.max)}
          onChange={e => update('maxPrice', Number(e.target.value))}
        />
        <div className={styles.sliderLabels}>
          <span>{formatPrice(stats.min, currency)}</span>
          <span>{formatPrice(stats.max, currency)}</span>
        </div>
      </div>

      {/* Stops */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Stops</h3>
        <div className={styles.checkboxGroup}>
          {[
            { value: 0, label: 'Direct only' },
            { value: 1, label: 'Max 1 stop' },
            { value: 99, label: 'Any' },
          ].map(({ value, label }) => (
            <label key={value} className={styles.checkboxLabel}>
              <input
                type="radio"
                name="maxStops"
                className={styles.radio}
                checked={(filters.maxStops ?? 99) === value}
                onChange={() => update('maxStops', value)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Airlines */}
      {allAirlines.length > 1 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Airlines</h3>
          <div className={styles.checkboxGroup}>
            {allAirlines.map((code, i) => (
              <label key={code} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={!filters.airlines?.length || filters.airlines.includes(code)}
                  onChange={() => toggleAirline(code)}
                />
                {allAirlineNames[i] ?? code}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        className={styles.resetBtn}
        onClick={() => onChange({ maxPrice: null, maxStops: 99, airlines: [] })}
      >
        Reset filters
      </button>
    </div>
  )
}
