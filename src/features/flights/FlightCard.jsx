import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge.jsx'
import { HeartIcon, SproutIcon } from '@/icons'
import { formatPrice, formatDuration, formatTime, formatCO2 } from '@/lib/formatters.js'
import styles from './FlightCard.module.css'

const AIRLINE_LOGO_BASE = 'https://content.r9cdn.net/rimg/provider-logos/airlines/v/symbols'

/**
 * Compact flight offer card for the results list.
 *
 * @param {object}   flight        - domain FlightOffer
 * @param {boolean}  isSelected    - highlighted state (selected on map)
 * @param {Function} onSelect      - called when card is clicked
 * @param {Function} onShowDetail  - called when "View details" is pressed
 * @param {Function} onSave        - called when heart icon is pressed
 * @param {boolean}  isSaved       - if true, heart is filled
 */
export function FlightCard({ flight, isSelected, onSelect, onShowDetail, onSave, isSaved }) {
  const { t } = useTranslation()

  const outSeg = flight.outbound.segments
  const firstSeg = outSeg[0]
  const lastSeg = outSeg.at(-1)

  const stopsLabel =
    flight.stops === 0
      ? t('formatters.direct')
      : flight.stops === 1
        ? t('formatters.oneStop')
        : t('formatters.stops', { count: flight.stops })

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect?.(flight)
    }
  }

  return (
    <motion.article
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        onSelect?.(flight)
        onShowDetail?.(flight)
      }}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={t('flights.ariaLabel', {
        origin: flight.origin.city,
        destination: flight.destination.city,
        price: formatPrice(flight.price, flight.currency),
      })}
    >
      <div className={styles.topRow}>
        <div className={styles.airline}>
          {flight.airlines?.[0] != null &&
            (flight.airlineLogoUrls?.[0] ? (
              <>
                <img
                  className={styles.airlineLogoImg}
                  src={flight.airlineLogoUrls[0]}
                  alt={flight.airlineNames?.[0]}
                  onError={e => {
                    e.target.style.display = 'none'
                  }}
                />
                <span className={styles.airlineName}>{flight.airlineNames?.join(', ') ?? ''}</span>
              </>
            ) : (
              <>
                <img
                  className={styles.airlineLogoImg}
                  src={`${AIRLINE_LOGO_BASE}/${flight.airlines[0]}.png`}
                  alt={flight.airlineNames?.[0]}
                  onError={e => {
                    e.target.style.display = 'none'
                  }}
                />
                <span className={styles.airlineName}>{flight.airlineNames?.join(', ') ?? ''}</span>
              </>
            ))}
        </div>

        <div className={styles.topActions}>
          <button
            className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
            onClick={e => {
              e.stopPropagation()
              onSave?.(flight)
            }}
            aria-label={isSaved ? t('flights.removeFromSaved') : t('flights.saveFlight')}
            aria-pressed={isSaved}
          >
            <HeartIcon size={16} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>

      <div className={styles.route}>
        <div className={styles.timeBlock}>
          <span className={styles.time}>{formatTime(firstSeg.departure.at)}</span>
          <span className={styles.iata}>{firstSeg.departure.iataCode}</span>
        </div>

        <div className={styles.routeMiddle}>
          <span className={styles.duration}>{formatDuration(flight.outbound.duration)}</span>
          <div className={styles.routeLine}>
            <div className={styles.routeDot} />
            <div className={styles.routeTrack}>
              {flight.stops > 0 && <span className={styles.stopCount}>{flight.stops}</span>}
            </div>
            <div className={`${styles.routeDot} ${styles.routeDotEnd}`} />
          </div>
          <span className={styles.stopsLabel}>{stopsLabel}</span>
        </div>

        <div className={`${styles.timeBlock} ${styles.timeBlockRight}`}>
          <span className={styles.time}>{formatTime(lastSeg.arrival.at)}</span>
          <span className={styles.iata}>{lastSeg.arrival.iataCode}</span>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.badges}>
          {flight.co2Kg > 0 && (
            <Badge variant="default" size="sm" title="Approximate CO₂ per passenger">
              <SproutIcon size={14} className={styles.sproutIcon} /> {formatCO2(flight.co2Kg)}
            </Badge>
          )}
        </div>

        <div className={styles.priceBlock}>
          <span className={styles.price}>{formatPrice(flight.price, flight.currency)}</span>
          <span className={styles.priceLabel}>{t('flights.perPerson')}</span>
        </div>
      </div>
    </motion.article>
  )
}
