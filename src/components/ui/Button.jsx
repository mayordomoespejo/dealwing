import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { SpinnerIcon } from '@/icons'
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
          <SpinnerIcon size={16} />
        </span>
      )}
      {!loading && icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </motion.button>
  )
})

export { Button }
