import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSaved } from './useSaved.js'
import { AirlineLogo } from '@/components/ui/AirlineLogo.jsx'
import { FlightDetail } from '@/features/flights/FlightDetail.jsx'
import { Modal } from '@/components/ui/Modal.jsx'
import { Badge } from '@/components/ui/Badge.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { formatPrice, formatDuration, formatTime, formatDate, formatCO2 } from '@/lib/formatters.js'
import { SproutIcon, TrashIcon, PaperPlaneIcon, HeartIcon, TakeoffIcon, LandingIcon } from '@/icons'
import styles from './SavedList.module.css'

/**
 * Saved flights page.
 *
 * @returns {JSX.Element}
 */
export function SavedList() {
  const { t } = useTranslation()
  const { saved, removeOffer, clearAll } = useSaved()
  const [detailFlight, setDetailFlight] = useState(null)
  const [pendingRemove, setPendingRemove] = useState(null)
  const [pendingClearAll, setPendingClearAll] = useState(false)

  if (!saved.length) {
    return <EmptySavedState />
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('saved.title')}</h1>
        <div className={styles.headerMeta}>
          <p className={styles.subtitle}>{t('saved.subtitle', { count: saved.length })}</p>
          <Button variant="ghost" size="sm" onClick={() => setPendingClearAll(true)}>
            {t('saved.clearAll')}
          </Button>
        </div>
      </div>

      <div className={styles.list}>
        <AnimatePresence mode="popLayout">
          {saved.map(entry => (
            <SavedFlightCard
              key={entry.id}
              entry={entry}
              onOpen={setDetailFlight}
              onRequestRemove={setPendingRemove}
            />
          ))}
        </AnimatePresence>
      </div>

      <FlightDetail
        flight={detailFlight}
        isOpen={!!detailFlight}
        onClose={() => setDetailFlight(null)}
      />

      <ConfirmationModal
        isOpen={!!pendingRemove}
        onClose={() => setPendingRemove(null)}
        title={t('saved.confirmRemoveTitle', {
          origin: pendingRemove?.offer.origin.iata,
          destination: pendingRemove?.offer.destination.iata,
        })}
        body={t('saved.confirmRemoveBody')}
        cancelLabel={t('saved.cancelRemove')}
        confirmLabel={t('saved.confirmRemove')}
        onConfirm={() => {
          removeOffer(pendingRemove.id)
          setPendingRemove(null)
        }}
      />

      <ConfirmationModal
        isOpen={pendingClearAll}
        onClose={() => setPendingClearAll(false)}
        title={t('saved.confirmClearTitle')}
        body={t('saved.confirmClearBody')}
        cancelLabel={t('saved.cancelClear')}
        confirmLabel={t('saved.confirmClear')}
        onConfirm={() => {
          clearAll()
          setPendingClearAll(false)
        }}
      />
    </div>
  )
}

/**
 * Empty state shown when there are no saved flights yet.
 *
 * @returns {JSX.Element}
 */
function EmptySavedState() {
  const { t } = useTranslation()

  return (
    <div className={styles.empty}>
      <HeartIcon size={64} fill="currentColor" className={styles.emptyIcon} />
      <h2 className={styles.emptyTitle}>{t('saved.noFlightsTitle')}</h2>
      <p className={styles.emptyText}>{t('saved.noFlightsHint')}</p>
      <Link to="/">
        <Button variant="primary" icon={<PaperPlaneIcon size={20} variant="inverse" />}>
          {t('saved.searchFlights')}
        </Button>
      </Link>
    </div>
  )
}

/**
 * Interactive saved-flight card.
 *
 * @param {object} props
 * @param {{ id: string, offer: object, savedAt: string }} props.entry - saved entry from local storage
 * @param {Function} props.onOpen - opens the flight detail modal
 * @param {Function} props.onRequestRemove - opens the remove confirmation modal
 * @returns {JSX.Element}
 */
function SavedFlightCard({ entry, onOpen, onRequestRemove }) {
  const { t } = useTranslation()
  const { id, offer, savedAt } = entry
  const outboundSegment = offer.outbound.segments[0]
  const inboundSegment = offer.inbound?.segments[0]

  return (
    <motion.article
      className={styles.card}
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => onOpen(offer)}
      role="button"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        onOpen(offer)
      }}
      aria-label={`${offer.origin.iata} → ${offer.destination.iata}, ${formatPrice(offer.price, offer.currency)}`}
    >
      <div className={styles.cardHeader}>
        <div className={styles.route}>
          <div className={styles.routeCity}>
            <span className={styles.routeIata}>{offer.origin.iata}</span>
            <span className={styles.routeCityName}>{offer.origin.city}</span>
          </div>
          <span className={styles.routeArrow}>{offer.isRoundTrip ? '⇄' : '→'}</span>
          <div className={styles.routeCity}>
            <span className={styles.routeIata}>{offer.destination.iata}</span>
            <span className={styles.routeCityName}>{offer.destination.city}</span>
          </div>
        </div>

        <div className={styles.priceBlock}>
          <span className={styles.price}>{formatPrice(offer.price, offer.currency)}</span>
          <span className={styles.priceLabel}>{t('flights.perPerson')}</span>
        </div>
      </div>

      <div className={styles.itineraryRows}>
        <SavedItineraryRow
          icon={<TakeoffIcon size={14} className={styles.itineraryIcon} />}
          segment={outboundSegment}
          duration={offer.outbound.duration}
        />
        {inboundSegment && <div className={styles.rowDivider} />}
        {inboundSegment && (
          <SavedItineraryRow
            icon={<LandingIcon size={14} className={styles.itineraryIcon} />}
            segment={inboundSegment}
            duration={offer.inbound.duration}
          />
        )}
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.badges}>
          {offer.co2Kg > 0 && (
            <Badge variant="default">
              <SproutIcon size={14} className={styles.sproutIcon} /> {formatCO2(offer.co2Kg)}
            </Badge>
          )}
        </div>

        <div className={styles.footerRight}>
          <span className={styles.savedAt}>
            {t('saved.savedOn', { date: new Date(savedAt).toLocaleDateString() })}
          </span>
          <button
            className={styles.trashBtn}
            onClick={event => {
              event.stopPropagation()
              onRequestRemove({ id, offer })
            }}
            aria-label={t('saved.removeSaved')}
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>
    </motion.article>
  )
}

/**
 * Single itinerary row displayed inside a saved-flight card.
 *
 * @param {object} props
 * @param {JSX.Element} props.icon - takeoff or landing icon
 * @param {object} props.segment - first segment of the slice
 * @param {string} props.duration - ISO 8601 slice duration
 * @returns {JSX.Element}
 */
function SavedItineraryRow({ icon, segment, duration }) {
  return (
    <>
      {icon}
      <span className={styles.itineraryDateTime}>
        {formatDate(segment.departure.at)} · {formatTime(segment.departure.at)}
      </span>
      <span className={styles.itineraryDuration}>{formatDuration(duration)}</span>
      <span className={styles.itineraryAirline}>
        <AirlineLogo
          code={segment.carrierCode}
          src={segment.carrierLogoUrl}
          alt={segment.carrierName}
          className={styles.itineraryAirlineLogo}
        />
        <span className={styles.itineraryAirlineName}>{segment.carrierName}</span>
      </span>
    </>
  )
}

/**
 * Reusable confirmation modal used by saved-flight destructive actions.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - modal visibility state
 * @param {Function} props.onClose - close handler
 * @param {string} props.title - translated modal title
 * @param {string} props.body - translated confirmation message
 * @param {string} props.cancelLabel - translated cancel button label
 * @param {string} props.confirmLabel - translated confirm button label
 * @param {Function} props.onConfirm - confirm action handler
 * @returns {JSX.Element}
 */
function ConfirmationModal({ isOpen, onClose, title, body, cancelLabel, confirmLabel, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className={styles.confirmBody}>
        <p className={styles.confirmText}>{body}</p>
        <div className={styles.confirmActions}>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
