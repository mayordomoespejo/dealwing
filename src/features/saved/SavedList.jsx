import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSaved } from './useSaved.js'
import { FlightDetail } from '@/features/flights/FlightDetail.jsx'
import { Badge } from '@/components/ui/Badge.jsx'
import { Button } from '@/components/ui/Button.jsx'
import {
  formatPrice,
  formatDuration,
  formatTime,
  formatDate,
  formatCO2,
  dealScoreColor,
} from '@/lib/formatters.js'
import styles from './SavedList.module.css'

export function SavedList() {
  const { t } = useTranslation()
  const { saved, removeOffer, clearAll } = useSaved()
  const [detailFlight, setDetailFlight] = useState(null)

  if (!saved.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>💙</div>
        <h2 className={styles.emptyTitle}>{t('saved.noFlightsTitle')}</h2>
        <p className={styles.emptyText}>{t('saved.noFlightsHint')}</p>
        <Link to="/">
          <Button variant="primary">{t('saved.searchFlights')}</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('saved.title')}</h1>
          <p className={styles.subtitle}>{t('saved.subtitle', { count: saved.length })}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearAll}>
          {t('saved.clearAll')}
        </Button>
      </div>

      <div className={styles.list}>
        <AnimatePresence mode="popLayout">
          {saved.map(({ id, offer, savedAt }) => {
            const stopsLabel =
              offer.stops === 0
                ? t('formatters.direct')
                : offer.stops === 1
                  ? t('formatters.oneStop')
                  : t('formatters.stops', { count: offer.stops })
            const dealLabel =
              offer.dealScore >= 70
                ? t('formatters.greatDeal')
                : offer.dealScore >= 40
                  ? t('formatters.goodDeal')
                  : t('formatters.fairDeal')

            return (
              <motion.article
                key={id}
                className={styles.card}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Route header */}
                <div className={styles.cardHeader}>
                  <div className={styles.route}>
                    <span className={styles.routeIata}>{offer.origin.iata}</span>
                    <span className={styles.routeArrow}>{offer.isRoundTrip ? '⇄' : '→'}</span>
                    <span className={styles.routeIata}>{offer.destination.iata}</span>
                    <span className={styles.routeCities}>
                      {offer.origin.city} → {offer.destination.city}
                    </span>
                  </div>

                  <div
                    className={styles.score}
                    style={{ '--score-color': dealScoreColor(offer.dealScore) }}
                  >
                    {offer.dealScore}
                    <span className={styles.scoreLabel}>{dealLabel}</span>
                  </div>
                </div>

                {/* Details row */}
                <div className={styles.details}>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>{t('saved.departs')}</span>
                    <span className={styles.detailValue}>
                      {formatTime(offer.outbound.segments[0].departure.at)}{' '}
                      {formatDate(offer.outbound.segments[0].departure.at)}
                    </span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>{t('saved.duration')}</span>
                    <span className={styles.detailValue}>
                      {formatDuration(offer.outbound.duration)}
                    </span>
                  </div>
                  <div className={styles.detail}>
                    <span className={styles.detailLabel}>{t('saved.airline')}</span>
                    <span className={styles.detailValue}>{offer.airlineNames[0]}</span>
                  </div>
                </div>

                {/* Badges + Price */}
                <div className={styles.cardFooter}>
                  <div className={styles.badges}>
                    <Badge variant={offer.stops === 0 ? 'success' : 'default'}>{stopsLabel}</Badge>
                    {offer.co2Kg > 0 && (
                      <Badge variant="default">🌱 {formatCO2(offer.co2Kg)}</Badge>
                    )}
                    <span className={styles.savedAt}>
                      {t('saved.savedOn', { date: new Date(savedAt).toLocaleDateString() })}
                    </span>
                  </div>

                  <div className={styles.cardActions}>
                    <Button variant="ghost" size="sm" onClick={() => setDetailFlight(offer)}>
                      {t('saved.details')}
                    </Button>
                    <span className={styles.price}>{formatPrice(offer.price, offer.currency)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOffer(id)}
                      aria-label={t('saved.removeSaved')}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </AnimatePresence>
      </div>

      <FlightDetail
        flight={detailFlight}
        isOpen={!!detailFlight}
        onClose={() => setDetailFlight(null)}
      />
    </div>
  )
}
