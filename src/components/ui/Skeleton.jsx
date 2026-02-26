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
      <div className={styles.row}>
        <Skeleton width={32} height={32} variant="circle" />
        <div className={styles.col}>
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
        </div>
        <Skeleton width={70} height={20} style={{ marginLeft: 'auto' }} />
      </div>
      <div className={styles.divider} />
      <div className={styles.row}>
        <Skeleton width={90} height={28} />
        <Skeleton width={40} height={12} style={{ margin: '0 auto' }} />
        <Skeleton width={90} height={28} style={{ marginLeft: 'auto' }} />
      </div>
      <div className={styles.row} style={{ marginTop: 12 }}>
        <Skeleton width={60} height={22} style={{ borderRadius: 999 }} />
        <Skeleton width={80} height={22} style={{ borderRadius: 999 }} />
        <Skeleton width={60} height={22} style={{ marginLeft: 'auto', borderRadius: 999 }} />
      </div>
    </div>
  )
}
