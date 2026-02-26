import { useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FlightCard } from './FlightCard.jsx'
import { FlightCardSkeleton } from '@/components/ui/Skeleton.jsx'
import { GlobeIcon } from '@/icons'
import { computePriceStats } from './dealScore.js'
import { formatPrice } from '@/lib/formatters.js'
import styles from './FlightList.module.css'

export function FlightList({
  flights,
  isLoading,
  error,
  selectedId,
  onSelect,
  onShowDetail,
  onSave,
  isSaved,
  searchParams,
}) {
  const { t } = useTranslation()

  const sorted = useMemo(() => {
    if (!flights?.length) return []
    return [...flights].sort((a, b) => a.price - b.price)
  }, [flights])

  const stats = useMemo(() => computePriceStats(sorted), [sorted])

  if (isLoading) {
    return (
      <div className={styles.list}>
        <div className={styles.listHeader}>
          <div className={styles.skeletonCount} />
        </div>
        {Array.from({ length: 5 }, (_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>✈️</div>
        <h3 className={styles.emptyTitle}>{t('flights.error')}</h3>
        <p className={styles.emptyText}>{error.message ?? t('flights.errorLoading')}</p>
      </div>
    )
  }

  if (!searchParams) {
    return (
      <div className={styles.empty}>
        <GlobeIcon size={48} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>{t('flights.searchPromptTitle')}</h3>
        <p className={styles.emptyText}>
          {t('flights.searchPromptHint')}
          <br />
          <span className={styles.hint}>{t('flights.searchProTip')}</span>
        </p>
      </div>
    )
  }

  if (!sorted.length) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>{t('flights.noFlightsTitle')}</h3>
        <p className={styles.emptyText}>{t('flights.noFlightsHint')}</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      <div className={styles.listHeader}>
        <span className={styles.resultCount}>{t('flights.results', { count: sorted.length })}</span>
        <div className={styles.priceInsights}>
          <span className={styles.insightItem}>
            <span className={styles.insightLabel}>{t('flights.from')}</span>
            <span className={styles.insightValue}>
              {formatPrice(stats.min, flights[0]?.currency)}
            </span>
          </span>
          <span className={styles.insightDivider}>·</span>
          <span className={styles.insightItem}>
            <span className={styles.insightLabel}>{t('flights.avg')}</span>
            <span className={styles.insightValue}>
              {formatPrice(stats.mean, flights[0]?.currency)}
            </span>
          </span>
        </div>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {sorted.map(flight => (
          <FlightCard
            key={flight.id}
            flight={flight}
            isSelected={flight.id === selectedId}
            onSelect={onSelect}
            onShowDetail={onShowDetail}
            onSave={onSave}
            isSaved={isSaved?.(flight)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
