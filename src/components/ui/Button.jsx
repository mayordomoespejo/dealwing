import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import styles from './Button.module.css'

/**
 * Button component.
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'}                          size
 * @param {boolean}                                  loading
 * @param {boolean}                                  fullWidth
 * @param {React.ReactNode}                          icon     - leading icon
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    icon,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading
  const cls = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <motion.button
      ref={ref}
      className={cls}
      disabled={isDisabled}
      whileTap={isDisabled ? {} : { scale: 0.97 }}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
        </span>
      )}
      {!loading && icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </motion.button>
  )
})

export { Button }
