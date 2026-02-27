import styles from './Badge.module.css'

/**
 * Small status badge / pill.
 * @param {'default'|'success'|'warning'|'error'|'info'|'brand'} variant
 * @param {'sm'|'md'} size
 */
export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]} ${className}`}>
      {children}
    </span>
  )
}
