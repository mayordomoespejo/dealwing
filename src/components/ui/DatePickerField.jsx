import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker } from 'react-day-picker'
import { es, enUS } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { useTranslation } from 'react-i18next'
import { parseDate, toISODate, formatDisplay } from '@/lib/dateUtils.js'
import { FieldError } from '@/components/ui/FieldError.jsx'
import styles from './DatePickerField.module.css'

/**
 * Date picker field with a calendar popover styled to match the app.
 * Value/onChange use YYYY-MM-DD strings for compatibility with forms.
 *
 * @param {string}   id        - for label and a11y
 * @param {string}   value     - current value YYYY-MM-DD
 * @param {Function} onChange  - (value: string YYYY-MM-DD) => void
 * @param {string}   [min]     - minimum date YYYY-MM-DD (e.g. today)
 * @param {string}   [label]
 * @param {string}   [error]   - error message to show below
 * @param {string}   [className]
 * @param {string}   [placeholder]
 */
export function DatePickerField({
  id,
  value,
  onChange,
  min,
  label,
  error,
  className = '',
  placeholder = '',
}) {
  const { i18n } = useTranslation()
  const locale = i18n.language === 'es' ? es : enUS
  const [open, setOpen] = useState(false)
  const [popoverRect, setPopoverRect] = useState(null)
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)

  const selectedDate = parseDate(value)
  const minDate = parseDate(min)
  const displayValue = selectedDate ? formatDisplay(selectedDate) : ''

  // Calendar month: follow selected date or min or today
  const [month, setMonth] = useState(() => selectedDate || minDate || new Date())
  useEffect(() => {
    if (selectedDate) setMonth(selectedDate)
    else if (minDate) setMonth(minDate)
    else setMonth(new Date())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, min])

  // Position popover below trigger (run when opening, useLayoutEffect to avoid flash)
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPopoverRect({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    })
  }, [open])

  // Close on click outside (trigger and popover are in different trees when using portal)
  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      const inTrigger = triggerRef.current?.contains(e.target)
      const inPopover = popoverRef.current?.contains(e.target)
      if (!inTrigger && !inPopover) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleSelect(date) {
    if (date) {
      onChange(toISODate(date))
      setOpen(false)
    }
  }

  const popoverContent =
    open && popoverRect ? (
      <div
        ref={popoverRef}
        className={styles.popover}
        role="dialog"
        aria-modal="true"
        aria-label="Choose date"
        style={{
          position: 'fixed',
          top: popoverRect.top,
          left: popoverRect.left,
          minWidth: Math.max(popoverRect.width, 280),
        }}
      >
        <DayPicker
          mode="single"
          locale={locale}
          selected={selectedDate}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={minDate ? { before: minDate } : undefined}
        />
      </div>
    ) : null

  return (
    <div className={`${styles.wrapper} ${className}`.trim()}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className={`${styles.trigger} ${error ? styles.triggerError : ''} ${open ? styles.triggerOpen : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={label ? `${label}, ${displayValue || placeholder || 'Select date'}` : undefined}
      >
        <span className={displayValue ? styles.value : styles.placeholder}>
          {displayValue || placeholder || 'dd/mm/yyyy'}
        </span>
        <span className={styles.calendarIcon} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
      </button>

      {popoverContent && createPortal(popoverContent, document.body)}

      <FieldError>{error}</FieldError>
    </div>
  )
}
