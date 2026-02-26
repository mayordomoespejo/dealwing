import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge.jsx'
import { Button } from '@/components/ui/Button.jsx'
import {
  formatPrice,
  formatDuration,
  formatStops,
  formatTime,
  formatCO2,
  dealScoreColor,
  dealScoreLabel,
} from '@/lib/formatters.js'
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
  const outSeg = flight.outbound.segments
  const firstSeg = outSeg[0]
  const lastSeg = outSeg.at(-1)

  const scoreColor = dealScoreColor(flight.dealScore)
  const scoreLabel = dealScoreLabel(flight.dealScore)

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
      onClick={() => onSelect?.(flight)}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      aria-label={`Flight from ${flight.origin.city} to ${flight.destination.city}, ${formatPrice(flight.price, flight.currency)}`}
    >
      {/* Top: airline + deal score + save */}
      <div className={styles.topRow}>
        <div className={styles.airline}>
          <img
            className={styles.airlineLogo}
            src={`${AIRLINE_LOGO_BASE}/${flight.airlines[0]}.png`}
            alt={flight.airlineNames[0]}
            onError={e => {
              e.target.style.display = 'none'
            }}
          />
          <span className={styles.airlineName}>{flight.airlineNames.join(', ')}</span>
        </div>

        <div className={styles.topActions}>
          <span
            className={styles.dealScore}
            style={{ '--score-color': scoreColor }}
            title={`Deal score: ${flight.dealScore}/100`}
          >
            {flight.dealScore}
          </span>

          <button
            className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
            onClick={e => {
              e.stopPropagation()
              onSave?.(flight)
            }}
            aria-label={isSaved ? 'Remove from saved' : 'Save flight'}
            aria-pressed={isSaved}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Middle: route timeline */}
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
          <span className={styles.stopsLabel}>{formatStops(flight.stops)}</span>
        </div>

        <div className={`${styles.timeBlock} ${styles.timeBlockRight}`}>
          <span className={styles.time}>{formatTime(lastSeg.arrival.at)}</span>
          <span className={styles.iata}>{lastSeg.arrival.iataCode}</span>
        </div>
      </div>

      {/* Bottom: price + tags + CTA */}
      <div className={styles.bottomRow}>
        <div className={styles.badges}>
          <Badge variant={flight.stops === 0 ? 'success' : 'default'} size="sm">
            {formatStops(flight.stops)}
          </Badge>
          {flight.co2Kg > 0 && (
            <Badge variant="default" size="sm" title="Approximate CO₂ per passenger">
              🌱 {formatCO2(flight.co2Kg)}
            </Badge>
          )}
          {flight.seatsAvailable <= 5 && (
            <Badge variant="warning" size="sm">
              {flight.seatsAvailable} seats left
            </Badge>
          )}
        </div>

        <div className={styles.priceBlock}>
          <span className={styles.price}>{formatPrice(flight.price, flight.currency)}</span>
          <span className={styles.priceLabel}>per person</span>
        </div>
      </div>

      {/* Deal label */}
      <div className={styles.dealLabel} style={{ '--score-color': scoreColor }}>
        {scoreLabel}
      </div>

      {/* Detail CTA */}
      <div
        className={styles.detailCta}
        onClick={e => {
          e.stopPropagation()
          onShowDetail?.(flight)
        }}
      >
        <Button variant="secondary" size="sm">
          View details
        </Button>
      </div>
    </motion.article>
  )
}
