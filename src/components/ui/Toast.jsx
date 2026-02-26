import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { InfoIcon, CheckCircleIcon, XCircleIcon, TriangleAlertIcon } from '@/icons'
import styles from './Toast.module.css'

/* ── Context ──────────────────────────────────────────────────────────────── */

const ToastContext = createContext(null)

let uid = 0

export function ToastProvider({ children }) {
  const { t } = useTranslation()
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ message, type = 'info', duration = 4000 }) => {
    const id = ++uid
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="false">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={`${styles.toast} ${styles[toast.type]}`}
              role="alert"
            >
              <span className={styles.icon}>{ICONS[toast.type]}</span>
              <p className={styles.message}>{toast.message}</p>
              <button
                className={styles.close}
                onClick={() => removeToast(toast.id)}
                aria-label={t('common.dismissNotification')}
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

const ICONS = {
  info: <InfoIcon size={16} />,
  success: <CheckCircleIcon size={16} />,
  error: <XCircleIcon size={16} />,
  warning: <TriangleAlertIcon size={16} />,
}

/* ── Hook ─────────────────────────────────────────────────────────────────── */

export function useToast() {
  const addToast = useContext(ToastContext)
  if (!addToast) throw new Error('useToast must be used inside <ToastProvider>')
  return {
    toast: addToast,
    success: msg => addToast({ message: msg, type: 'success' }),
    error: msg => addToast({ message: msg, type: 'error' }),
    info: msg => addToast({ message: msg, type: 'info' }),
    warning: msg => addToast({ message: msg, type: 'warning' }),
  }
}
