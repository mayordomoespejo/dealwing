import { memo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge.jsx'
import { AirlineLogo } from '@/components/ui/AirlineLogo.jsx'
import { HeartIcon, SproutIcon, TakeoffIcon, LandingIcon } from '@/icons'
import { formatPrice, formatDuration, formatTime, formatCO2 } from '@/lib/formatters.js'
import styles from './FlightCard.module.css'

/**
 * Builds the list of airline logo and name data displayed in the card header.
 *
 * @param {object} flight - flight offer shown by the card
 * @returns {{ code: string, name: string, src: string | null }[]}
 */
function getAirlineDisplayData(flight) {
  return (flight.airlines ?? []).map((code, index) => ({
    code,
    name: flight.airlineNames?.[index] ?? code,
    src: flight.airlineLogoUrls?.[index] ?? null,
  }))
}

/**
 * Compact flight offer card for the results list.
 * Memoized to prevent unnecessary re-renders when the parent list re-renders
 * (e.g. on map interactions) but the flight data hasn't changed.
 *
 * @param {object}   flight        - domain FlightOffer
 * @param {boolean}  isSelected    - highlighted state (selected on map)
 * @param {Function} onSelect      - called when card is clicked
 * @param {Function} onShowDetail  - called when "View details" is pressed
 * @param {Function} onSave        - called when heart icon is pressed
 * @param {boolean}  isSaved       - if true, heart is filled
 */
export const FlightCard = memo(function FlightCard({
  flight,
  isSelected,
  onSelect,
  onShowDetail,
  onSave,
  isSaved,
}) {
  const { t } = useTranslation()
  const airlines = getAirlineDisplayData(flight)

  const outSeg = flight.outbound.segments
  const firstSeg = outSeg[0]
  const lastSeg = outSeg.at(-1)

  const inSeg = flight.inbound?.segments
  const inFirstSeg = inSeg?.[0]
  const inLastSeg = inSeg?.at(-1)

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
          {airlines[0] && (
            <>
              <AirlineLogo
                code={airlines[0].code}
                src={airlines[0].src}
                alt={airlines[0].name}
                className={styles.airlineLogoImg}
              />
              <span className={styles.airlineName}>
                {airlines.map(airline => airline.name).join(', ')}
              </span>
            </>
          )}
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

      <div className={styles.routes}>
        <div className={styles.route}>
          <div className={styles.timeBlock}>
            <span className={styles.time}>{formatTime(firstSeg.departure.at)}</span>
            <span className={styles.iata}>{firstSeg.departure.iataCode}</span>
          </div>

          <div className={styles.routeMiddle}>
            <TakeoffIcon size={14} className={styles.routeIcon} />
            <div className={styles.routeLine}>
              <div className={styles.routeDot} />
              <div className={styles.routeTrack} />
              <div className={`${styles.routeDot} ${styles.routeDotEnd}`} />
            </div>
            <span className={styles.duration}>{formatDuration(flight.outbound.duration)}</span>
          </div>

          <div className={`${styles.timeBlock} ${styles.timeBlockRight}`}>
            <span className={styles.time}>{formatTime(lastSeg.arrival.at)}</span>
            <span className={styles.iata}>{lastSeg.arrival.iataCode}</span>
          </div>
        </div>

        {flight.inbound && inFirstSeg && inLastSeg && (
          <>
            <div className={styles.routeSeparator} />
            <div className={styles.route}>
              <div className={styles.timeBlock}>
                <span className={styles.time}>{formatTime(inFirstSeg.departure.at)}</span>
                <span className={styles.iata}>{inFirstSeg.departure.iataCode}</span>
              </div>

              <div className={styles.routeMiddle}>
                <LandingIcon size={14} className={styles.routeIcon} />
                <div className={styles.routeLine}>
                  <div className={styles.routeDot} />
                  <div className={styles.routeTrack} />
                  <div className={`${styles.routeDot} ${styles.routeDotEnd}`} />
                </div>
                <span className={styles.duration}>{formatDuration(flight.inbound.duration)}</span>
              </div>

              <div className={`${styles.timeBlock} ${styles.timeBlockRight}`}>
                <span className={styles.time}>{formatTime(inLastSeg.arrival.at)}</span>
                <span className={styles.iata}>{inLastSeg.arrival.iataCode}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.badges}>
          {flight.co2Kg > 0 && (
            <Badge variant="default" size="sm" title={t('detail.co2Disclaimer')}>
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
})
