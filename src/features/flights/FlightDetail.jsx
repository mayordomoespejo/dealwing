import { useTranslation } from 'react-i18next'
import { Modal } from '@/components/ui/Modal.jsx'
import { Badge } from '@/components/ui/Badge.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { useSaved } from '@/features/saved/useSaved.js'
import { HeartIcon, SproutIcon, ClockIcon } from '@/icons'
import { formatPrice, formatDuration, formatTime, formatDate, formatCO2 } from '@/lib/formatters.js'
import styles from './FlightDetail.module.css'

/**
 * Full flight detail modal.
 * Shows segments, timelines, deal score breakdown, CO₂ estimate.
 */
export function FlightDetail({ flight, isOpen, onClose }) {
  const { t } = useTranslation()
  const { isSaved, saveOffer, removeOffer } = useSaved()

  if (!flight) return null

  const saved = isSaved(flight.id)
  const stopsLabel =
    flight.stops === 0
      ? t('formatters.direct')
      : flight.stops === 1
        ? t('formatters.oneStop')
        : t('formatters.stops', { count: flight.stops })

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('detail.title')} size="lg">
      <div className={styles.content}>
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
            <Badge variant="default">
              {t(flight.isRoundTrip ? 'detail.roundTrip' : 'detail.oneWay')}
            </Badge>
            <Badge variant={flight.stops === 0 ? 'success' : 'default'}>{stopsLabel}</Badge>
            <Badge variant="info">{flight.airlineNames.join(', ')}</Badge>
          </div>
        </div>

        <ItinerarySection
          label={t('detail.outbound')}
          segments={flight.outbound.segments}
          duration={flight.outbound.duration}
          stops={flight.outbound.stops}
        />

        {flight.inbound && (
          <ItinerarySection
            label={t('detail.return')}
            segments={flight.inbound.segments}
            duration={flight.inbound.duration}
            stops={flight.inbound.stops}
          />
        )}

        {flight.co2Kg > 0 && (
          <div className={styles.co2Card}>
            <div className={styles.co2Header}>
              <SproutIcon size={24} className={styles.co2Icon} />
              <div>
                <span className={styles.co2Value}>{formatCO2(flight.co2Kg)}</span>
                <span className={styles.co2Label}> {t('detail.co2PerPassenger')}</span>
              </div>
            </div>
            <p className={styles.co2Disclaimer}>⚠️ {t('detail.co2Disclaimer')}</p>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerPrice}>
            <span className={styles.footerPriceValue}>
              {formatPrice(flight.price, flight.currency)}
            </span>
            <span className={styles.footerPriceLabel}>{t('detail.perPersonTotal')}</span>
          </div>
          <div className={styles.footerActions}>
            <Button
              variant={saved ? 'danger' : 'secondary'}
              onClick={() => (saved ? removeOffer(flight.id) : saveOffer(flight))}
              icon={<HeartIcon size={16} fill={saved ? 'currentColor' : 'none'} />}
            >
              {saved ? t('detail.unsave') : t('detail.save')}
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                alert(t('detail.bookingSoon'))
              }}
            >
              {t('detail.bookNow')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

/**
 * Renders a flight itinerary section with segment-level timing details.
 * @param {object} props
 * @param {string} props.label
 * @param {object[]} props.segments
 * @param {string} props.duration
 * @returns {JSX.Element}
 */
function ItinerarySection({ label, segments, duration }) {
  const { t } = useTranslation()

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
              <div className={styles.timeline}>
                <div className={styles.dot} />
                {i < segments.length - 1 && <div className={styles.line} />}
              </div>

              <div className={styles.segContent}>
                <div className={styles.segRow}>
                  <div className={styles.segTime}>
                    <span className={styles.segTimeVal}>{formatTime(seg.departure.at)}</span>
                    <span className={styles.segDate}>{formatDate(seg.departure.at)}</span>
                  </div>
                  <div className={styles.segPlace}>
                    <span className={styles.segIata}>{seg.departure.iataCode}</span>
                    {seg.departure.terminal && (
                      <span className={styles.segTerminal}>
                        {t('detail.terminal', { n: seg.departure.terminal })}
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.segFlightInfo}>
                  <span className={styles.segFlight}>{seg.flightNumber}</span>
                  <span className={styles.segAircraft}>{seg.aircraftCode}</span>
                  <span className={styles.segDuration}>{formatDuration(seg.duration)}</span>
                </div>

                <div className={styles.segRow}>
                  <div className={styles.segTime}>
                    <span className={styles.segTimeVal}>{formatTime(seg.arrival.at)}</span>
                    <span className={styles.segDate}>{formatDate(seg.arrival.at)}</span>
                  </div>
                  <div className={styles.segPlace}>
                    <span className={styles.segIata}>{seg.arrival.iataCode}</span>
                    {seg.arrival.terminal && (
                      <span className={styles.segTerminal}>
                        {t('detail.terminal', { n: seg.arrival.terminal })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {i < segments.length - 1 && (
              <div className={styles.layover}>
                <ClockIcon size={12} />
                {t('detail.layover', { iata: seg.arrival.iataCode })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
