import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSaved } from './useSaved.js'
import { FlightDetail } from '@/features/flights/FlightDetail.jsx'
import { Badge } from '@/components/ui/Badge.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { formatPrice, formatDuration, formatTime, formatDate, formatCO2 } from '@/lib/formatters.js'
import { SproutIcon, TrashIcon, PaperPlaneIcon, HeartIcon } from '@/icons'
import styles from './SavedList.module.css'

export function SavedList() {
  const { t } = useTranslation()
  const { saved, removeOffer, clearAll } = useSaved()
  const [detailFlight, setDetailFlight] = useState(null)

  if (!saved.length) {
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
                <div className={styles.cardHeader}>
                  <div className={styles.route}>
                    <span className={styles.routeIata}>{offer.origin.iata}</span>
                    <span className={styles.routeArrow}>{offer.isRoundTrip ? '⇄' : '→'}</span>
                    <span className={styles.routeIata}>{offer.destination.iata}</span>
                    <span className={styles.routeCities}>
                      {offer.origin.city} → {offer.destination.city}
                    </span>
                  </div>
                </div>

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

                <div className={styles.cardFooter}>
                  <div className={styles.badges}>
                    <Badge variant={offer.stops === 0 ? 'success' : 'default'}>{stopsLabel}</Badge>
                    {offer.co2Kg > 0 && (
                      <Badge variant="default">
                        <SproutIcon size={14} className={styles.sproutIcon} />{' '}
                        {formatCO2(offer.co2Kg)}
                      </Badge>
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
                      <TrashIcon size={16} />
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
