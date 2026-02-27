import styles from './Skeleton.module.css'

/**
 * Skeleton loading placeholder.
 * @param {string} className  - extra class for custom sizing
 * @param {'rect'|'circle'}  variant
 */
export function Skeleton({ className = '', variant = 'rect', width, height, style }) {
  const cls = [styles.skeleton, variant === 'circle' ? styles.circle : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      className={cls}
      aria-hidden="true"
      style={{ width, height, borderRadius: variant === 'circle' ? '50%' : undefined, ...style }}
    />
  )
}

/** Pre-built card skeleton that matches a FlightCard */
export function FlightCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <Skeleton width={18} height={18} variant="circle" />
        <Skeleton width={100} height={12} />
        <Skeleton width={32} height={32} style={{ marginLeft: 'auto', borderRadius: 8 }} />
      </div>

      <div className={styles.routes}>
        <div className={styles.routeRow}>
          <div className={styles.timeCol}>
            <Skeleton width={52} height={22} />
            <Skeleton width={28} height={10} />
          </div>
          <div className={styles.routeMiddle}>
            <Skeleton width={14} height={14} style={{ borderRadius: '50%' }} />
            <Skeleton height={2} style={{ width: '100%' }} />
            <Skeleton width={38} height={11} />
          </div>
          <div className={styles.timeColRight}>
            <Skeleton width={52} height={22} />
            <Skeleton width={28} height={10} />
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <Skeleton width={76} height={20} style={{ borderRadius: 999 }} />
        <div className={styles.priceGroup}>
          <Skeleton width={60} height={26} />
          <Skeleton width={22} height={10} />
        </div>
      </div>
    </div>
  )
}
