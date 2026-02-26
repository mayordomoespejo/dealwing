import { useRef, forwardRef, useImperativeHandle } from 'react'
import { useTranslation } from 'react-i18next'
import { useMap } from './useMap.js'
import styles from './MapView.module.css'

/**
 * MapLibre GL map container.
 *
 * Exposes { flyToDest(iata) } via ref for programmatic panning from the parent.
 * Destination is fixed to RMU and is not clickable.
 *
 * @param {object[]} flights     - domain flight offers (for routes)
 * @param {string}   selectedId  - selected flight id
 * @param {object}   searchParams
 */
export const MapView = forwardRef(function MapView(
  { flights = [], selectedId, searchParams },
  ref
) {
  const { t, i18n } = useTranslation()
  const containerRef = useRef(null)

  const { flyToDest } = useMap({
    containerRef,
    flights,
    selectedId,
    searchParams,
    language: i18n.language,
  })

  useImperativeHandle(ref, () => ({ flyToDest }), [flyToDest])

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.map} aria-label={t('map.ariaLabel')} />

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
          <span className={styles.legendIcon}>
            <span className={styles.legendDotOrigin} />
          </span>
          {t('map.origin')}
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendIcon}>
            <span className={styles.legendDotDest} />
          </span>
          {t('map.destination')}
        </div>
      </div>
    </div>
  )
})
