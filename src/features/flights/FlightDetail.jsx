import { Modal } from '@/components/ui/Modal.jsx'
import { Badge } from '@/components/ui/Badge.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { useSaved } from '@/features/saved/useSaved.js'
import {
  formatPrice,
  formatDuration,
  formatTime,
  formatDate,
  formatStops,
  formatCO2,
  dealScoreColor,
  dealScoreLabel,
} from '@/lib/formatters.js'
import styles from './FlightDetail.module.css'

/**
 * Full flight detail modal.
 * Shows segments, timelines, deal score breakdown, CO₂ estimate.
 */
export function FlightDetail({ flight, isOpen, onClose }) {
  const { isSaved, saveOffer, removeOffer } = useSaved()

  if (!flight) return null

  const saved = isSaved(flight.id)
  const scoreColor = dealScoreColor(flight.dealScore)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Flight details" size="lg">
      <div className={styles.content}>
        {/* Route summary header */}
        <div className={styles.summary}>
          <div className={styles.summaryRoute}>
            <div className={styles.summaryCity}>
              <span className={styles.summaryIata}>{flight.origin.iata}</span>
              <span className={styles.summaryCityName}>{flight.origin.city}</span>
            </div>
            <div className={styles.summaryArrow}>{flight.isRoundTrip ? '⇄' : '→'}</div>
            <div className={`${styles.summaryCity} ${styles.summaryCityRight}`}>
              <span className={styles.summaryIata}>{flight.destination.iata}</span>
              <span className={styles.summaryCityName}>{flight.destination.city}</span>
            </div>
          </div>

          <div className={styles.summaryMeta}>
            <Badge variant="default">{flight.isRoundTrip ? 'Round trip' : 'One way'}</Badge>
            <Badge variant={flight.stops === 0 ? 'success' : 'default'}>
              {formatStops(flight.stops)}
            </Badge>
            <Badge variant="info">{flight.airlineNames.join(', ')}</Badge>
          </div>
        </div>

        {/* Deal score card */}
        <div className={styles.scoreCard} style={{ '--score-color': scoreColor }}>
          <div className={styles.scoreGauge}>
            <svg viewBox="0 0 100 60" className={styles.gaugeArc}>
              <path
                d="M 10 55 A 45 45 0 0 1 90 55"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d="M 10 55 A 45 45 0 0 1 90 55"
                fill="none"
                stroke="var(--score-color)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="141.4"
                strokeDashoffset={141.4 * (1 - flight.dealScore / 100)}
              />
            </svg>
            <span className={styles.gaugeValue}>{flight.dealScore}</span>
          </div>
          <div className={styles.scoreDetails}>
            <span className={styles.scoreLabel} style={{ color: scoreColor }}>
              {dealScoreLabel(flight.dealScore)}
            </span>
            <p className={styles.scoreDesc}>
              Scored relative to all results for this search. Based on price, duration, and stops.
            </p>
          </div>
        </div>

        {/* Outbound itinerary */}
        <ItinerarySection
          label="Outbound"
          segments={flight.outbound.segments}
          duration={flight.outbound.duration}
          stops={flight.outbound.stops}
        />

        {/* Return itinerary */}
        {flight.inbound && (
          <ItinerarySection
            label="Return"
            segments={flight.inbound.segments}
            duration={flight.inbound.duration}
            stops={flight.inbound.stops}
          />
        )}

        {/* CO₂ estimate */}
        {flight.co2Kg > 0 && (
          <div className={styles.co2Card}>
            <div className={styles.co2Header}>
              <span className={styles.co2Icon}>🌱</span>
              <div>
                <span className={styles.co2Value}>{formatCO2(flight.co2Kg)}</span>
                <span className={styles.co2Label}> per passenger</span>
              </div>
            </div>
            <p className={styles.co2Disclaimer}>
              ⚠️ Approximate estimate based on average emission factors (ICAO simplified method).
              Actual emissions vary by aircraft, load factor, and routing.
            </p>
          </div>
        )}

        {/* Price + CTA */}
        <div className={styles.footer}>
          <div className={styles.footerPrice}>
            <span className={styles.footerPriceValue}>
              {formatPrice(flight.price, flight.currency)}
            </span>
            <span className={styles.footerPriceLabel}>per person, total</span>
          </div>
          <div className={styles.footerActions}>
            <Button
              variant={saved ? 'danger' : 'secondary'}
              onClick={() => (saved ? removeOffer(flight.id) : saveOffer(flight))}
              icon={
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={saved ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              }
            >
              {saved ? 'Unsave' : 'Save'}
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                // In a real app: open booking link / affiliate URL
                alert('Booking integration coming soon!')
              }}
            >
              Book now →
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

/* ── Itinerary Section ─────────────────────────────────────────────────── */
function ItinerarySection({ label, segments, duration }) {
  return (
    <div className={styles.itinerary}>
      <div className={styles.itineraryHeader}>
        <h3 className={styles.itineraryLabel}>{label}</h3>
        <span className={styles.itineraryDuration}>{formatDuration(duration)}</span>
      </div>

      <div className={styles.segments}>
        {segments.map((seg, i) => (
          <div key={seg.id} className={styles.segmentWrapper}>
            <div className={styles.segment}>
              {/* Timeline dot */}
              <div className={styles.timeline}>
                <div className={styles.dot} />
                {i < segments.length - 1 && <div className={styles.line} />}
              </div>

              <div className={styles.segContent}>
                {/* Departure */}
                <div className={styles.segRow}>
                  <div className={styles.segTime}>
                    <span className={styles.segTimeVal}>{formatTime(seg.departure.at)}</span>
                    <span className={styles.segDate}>{formatDate(seg.departure.at)}</span>
                  </div>
                  <div className={styles.segPlace}>
                    <span className={styles.segIata}>{seg.departure.iataCode}</span>
                    {seg.departure.terminal && (
                      <span className={styles.segTerminal}>Terminal {seg.departure.terminal}</span>
                    )}
                  </div>
                </div>

                {/* Flight info */}
                <div className={styles.segFlightInfo}>
                  <span className={styles.segFlight}>{seg.flightNumber}</span>
                  <span className={styles.segAircraft}>{seg.aircraftCode}</span>
                  <span className={styles.segDuration}>{formatDuration(seg.duration)}</span>
                </div>

                {/* Arrival */}
                <div className={styles.segRow}>
                  <div className={styles.segTime}>
                    <span className={styles.segTimeVal}>{formatTime(seg.arrival.at)}</span>
                    <span className={styles.segDate}>{formatDate(seg.arrival.at)}</span>
                  </div>
                  <div className={styles.segPlace}>
                    <span className={styles.segIata}>{seg.arrival.iataCode}</span>
                    {seg.arrival.terminal && (
                      <span className={styles.segTerminal}>Terminal {seg.arrival.terminal}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Layover indicator */}
            {i < segments.length - 1 && (
              <div className={styles.layover}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                Layover at {seg.arrival.iataCode}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
