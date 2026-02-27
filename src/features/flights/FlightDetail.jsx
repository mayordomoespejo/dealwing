import { useTranslation } from 'react-i18next'
import { AirlineLogo } from '@/components/ui/AirlineLogo.jsx'
import { Modal } from '@/components/ui/Modal.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { useSaved } from '@/features/saved/useSaved.js'
import {
  HeartIcon,
  SproutIcon,
  ClockIcon,
  DangerZoneIcon,
  ChevronDownIcon,
  TakeoffIcon,
  LandingIcon,
} from '@/icons'
import { formatPrice, formatDuration, formatTime, formatDate, formatCO2 } from '@/lib/formatters.js'
import styles from './FlightDetail.module.css'

/**
 * Full flight detail modal.
 * Shows itineraries, layovers and per-passenger CO2 information.
 *
 * @param {object} props
 * @param {object|null} props.flight - selected flight offer
 * @param {boolean} props.isOpen - modal visibility state
 * @param {Function} props.onClose - close handler
 * @returns {JSX.Element | null}
 */
export function FlightDetail({ flight, isOpen, onClose }) {
  const { t } = useTranslation()
  const { isSaved, saveOffer, removeOffer } = useSaved()

  if (!flight) return null

  const saved = isSaved(flight.id)

  const ariaTitle = `${flight.origin.iata} ${flight.isRoundTrip ? '⇄' : '→'} ${flight.destination.iata}`

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ariaTitle}
      titleNode={<RouteSummary flight={flight} />}
      size="lg"
    >
      <div className={styles.content}>
        <div className={styles.itineraries}>
          <ItinerarySection
            label={t('detail.outbound')}
            segments={flight.outbound.segments}
            duration={flight.outbound.duration}
          />

          {flight.inbound && (
            <ItinerarySection
              label={t('detail.return')}
              segments={flight.inbound.segments}
              duration={flight.inbound.duration}
            />
          )}
        </div>

        {flight.co2Kg > 0 && (
          <div className={styles.co2Card}>
            <div className={styles.co2Header}>
              <SproutIcon size={24} className={styles.co2Icon} />
              <div className={styles.co2HeaderText}>
                <span className={styles.co2Value}>{formatCO2(flight.co2Kg)}</span>
                <span className={styles.co2Label}>{t('flights.perPerson')}</span>
              </div>
            </div>
            <p className={styles.co2Disclaimer}>
              <DangerZoneIcon size={20} fill="#eab308" className={styles.co2DisclaimerIcon} />
              <span>{t('detail.co2Disclaimer')}</span>
            </p>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerPrice}>
            <span className={styles.footerPriceValue}>
              {formatPrice(flight.price, flight.currency)}
            </span>
            <span className={styles.footerPriceLabel}>{t('flights.perPerson')}</span>
          </div>
          <div className={styles.footerActions}>
            <Button
              variant={saved ? 'danger' : 'secondary'}
              size="lg"
              onClick={() => (saved ? removeOffer(flight.id) : saveOffer(flight))}
              icon={
                <span className={styles.footerBtnIcon}>
                  <HeartIcon size={16} fill={saved ? 'currentColor' : 'none'} />
                </span>
              }
              className={styles.footerBtn}
            >
              {saved ? (
                <>
                  <span className={styles.btnLabelFull}>{t('detail.unsave')}</span>
                  <span className={styles.btnLabelShort}>{t('detail.unsaveShort')}</span>
                </>
              ) : (
                t('detail.save')
              )}
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                alert(t('detail.bookingSoon'))
              }}
              className={styles.footerBtn}
            >
              <>
                <span className={styles.btnLabelFull}>{t('detail.bookNow')}</span>
                <span className={styles.btnLabelShort}>{t('detail.bookNowShort')}</span>
              </>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function formatLayoverMin(min) {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Compact route summary shown in the modal title.
 *
 * @param {object} props
 * @param {object} props.flight - selected flight offer
 * @returns {JSX.Element}
 */
function RouteSummary({ flight }) {
  return (
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
  )
}

/**
 * Itinerary section for either the outbound or inbound slice.
 *
 * @param {object} props
 * @param {string} props.label - translated section heading
 * @param {object[]} props.segments - ordered slice segments
 * @param {string} props.duration - ISO 8601 slice duration
 * @returns {JSX.Element}
 */
function ItinerarySection({ label, segments, duration }) {
  const { t } = useTranslation()
  const firstSeg = segments[0]

  return (
    <div className={styles.itinerary}>
      <div className={styles.itineraryHeader}>
        <div className={styles.itineraryLabelGroup}>
          <h3 className={styles.itineraryLabel}>{label}</h3>
          <ChevronDownIcon size={12} className={styles.itineraryChevron} />
          <span className={styles.itineraryAirline}>
            <AirlineLogo
              code={firstSeg.carrierCode}
              src={firstSeg.carrierLogoUrl}
              alt={firstSeg.carrierName}
              className={styles.itineraryAirlineLogo}
            />
            <span className={styles.itineraryAirlineName}>{firstSeg.carrierName}</span>
          </span>
        </div>
        <span className={styles.itineraryDuration}>{formatDuration(duration)}</span>
      </div>

      <div className={styles.segments}>
        {segments.map((seg, i) => {
          const nextSeg = segments[i + 1]
          const layoverMin = nextSeg
            ? Math.round((new Date(nextSeg.departure.at) - new Date(seg.arrival.at)) / 60000)
            : 0

          return (
            <div key={seg.id} className={styles.segmentWrapper}>
              <div className={styles.segment}>
                <div className={styles.segContent}>
                  <div className={styles.segRow}>
                    <TakeoffIcon size={16} className={styles.segIcon} />
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

                  <div className={styles.segDivider} />

                  <div className={styles.segRow}>
                    <LandingIcon size={16} className={styles.segIcon} />
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
                  <span>{t('detail.layover', { iata: seg.arrival.iataCode })}</span>
                  {layoverMin > 0 && (
                    <span className={styles.layoverDuration}>{formatLayoverMin(layoverMin)}</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
