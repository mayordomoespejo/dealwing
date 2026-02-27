import styles from './FieldError.module.css'

/**
 * Error message shown under a field. Parent must have position: relative.
 * Same size and color as existing field errors (text-xs, color-error).
 *
 * @param {React.ReactNode} [children] - Error message text (nothing rendered if empty)
 * @param {string}          [className]
 */
export function FieldError({ children, className = '' }) {
  if (!children) return null
  return (
    <span className={`${styles.error} ${className}`.trim()} role="alert">
      {children}
    </span>
  )
}
