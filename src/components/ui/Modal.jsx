import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useKeyboard } from '@/hooks/useKeyboard.js'
import { XIcon } from '@/icons'
import styles from './Modal.module.css'

/**
 * Accessible modal / bottom-drawer.
 * On desktop: centered modal.
 * On mobile (< 640px): slides up from the bottom as a drawer.
 */
export function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  const { t } = useTranslation()
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const prev = document.activeElement
    dialogRef.current?.focus()
    return () => prev?.focus()
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useKeyboard('Escape', onClose, { enabled: isOpen })

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          aria-hidden="true"
        >
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={`${styles.panel} ${styles[size]}`}
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>{title}</h2>
              <button className={styles.closeBtn} onClick={onClose} aria-label={t('common.close')}>
                <XIcon size={20} />
              </button>
            </div>
            <div className={styles.body}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
