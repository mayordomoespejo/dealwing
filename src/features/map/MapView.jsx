import { useRef } from 'react'
import { useMap } from './useMap.js'
import styles from './MapView.module.css'

/**
 * MapLibre GL map container.
 *
 * @param {object[]} flights     - domain flight offers (for markers/routes)
 * @param {string}   selectedId  - selected flight id
 * @param {Function} onSelect    - (flight) => void
 * @param {object}   searchParams
 */
export function MapView({ flights = [], selectedId, onSelect, searchParams }) {
  const containerRef = useRef(null)

  useMap({
    containerRef,
    flights,
    selectedId,
    onSelect,
    searchParams,
  })

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.map} aria-label="Flight destinations map" />

      {/* Attribution overlay for OpenFreeMap */}
      <div className={styles.attribution}>
        Map ©{' '}
        <a href="https://openfreemap.org" target="_blank" rel="noopener">
          OpenFreeMap
        </a>
        {' · '}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">
          OSM
        </a>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDotOrigin} />
          Origin
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDotDest} />
          Destination
        </div>
      </div>
    </div>
  )
}
