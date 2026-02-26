import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker } from 'react-day-picker'
import { es, enUS } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { useTranslation } from 'react-i18next'
import { parseDate, toISODate, formatDisplay, todayISO } from '@/lib/dateUtils.js'
import { FieldError } from '@/components/ui/FieldError.jsx'
import styles from './DateRangePickerField.module.css'

/**
 * Single input for departure + return date range.
 * - One trigger showing "from – to" or "from" for one-way.
 * - Calendar in range mode with "Hoy" (Today) shortcut.
 *
 * @param {string}   id             - for label and a11y
 * @param {{ departureDate: string, returnDate: string }} value
 * @param {Function} onChange       - ({ departureDate, returnDate }) => void
 * @param {string}   [min]          - minimum date YYYY-MM-DD (e.g. today)
 * @param {'one-way'|'round-trip'} tripType
 * @param {string}   [label]
 * @param {string}   [error]
 * @param {string}   [className]
 * @param {string}   [placeholder]
 * @param {string}   [todayLabel]   - e.g. "Hoy" / "Today"
 * @param {string}   [clearLabel]   - e.g. "Borrar" / "Clear"
 */
export function DateRangePickerField({
  id,
  value,
  onChange,
  min,
  tripType,
  label,
  error,
  className = '',
  placeholder = '',
  todayLabel = 'Today',
  clearLabel = 'Clear',
}) {
  const { i18n } = useTranslation()
  const locale = i18n.language === 'es' ? es : enUS
  const { departureDate, returnDate } = value || {}
  const [open, setOpen] = useState(false)
  const [popoverRect, setPopoverRect] = useState(null)
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)

  const fromDate = parseDate(departureDate)
  const toDate = parseDate(returnDate)
  const minDate = parseDate(min)

  const selectedRange = fromDate
    ? { from: fromDate, to: tripType === 'round-trip' ? (toDate ?? undefined) : undefined }
    : undefined

  const displayParts = []
  if (fromDate) displayParts.push(formatDisplay(fromDate))
  if (tripType === 'round-trip' && toDate && toISODate(fromDate) !== toISODate(toDate)) {
    displayParts.push(formatDisplay(toDate))
  }
  const displayValue = displayParts.length ? displayParts.join(' – ') : ''

  const [month, setMonth] = useState(() => fromDate || minDate || new Date())
  useEffect(() => {
    if (fromDate) setMonth(fromDate)
    else if (minDate) setMonth(minDate)
    else setMonth(new Date())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departureDate, min])

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPopoverRect({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    })
  }, [open])

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

  function handleSelect(range) {
    if (!range?.from) return
    let departureDate
    let returnDateStr = ''
    const hasExistingRange = tripType === 'round-trip' && fromDate && toDate

    if (tripType === 'round-trip' && range.to) {
      // Dos fechas en la selección actual: la anterior es salida, la posterior es vuelta
      const start = range.from.getTime() <= range.to.getTime() ? range.from : range.to
      const end = range.from.getTime() <= range.to.getTime() ? range.to : range.from
      departureDate = toISODate(start)
      returnDateStr = toISODate(end)
    } else if (hasExistingRange && !range.to) {
      // Tercera selección: ya hay salida y vuelta, se clica otra fecha.
      // La vuelta actual actúa como "segunda" (pivot): si la tercera es anterior → salida=tercera, vuelta=pivot; si es posterior → salida=pivot, vuelta=tercera
      const pivot = toDate
      const clicked = range.from
      const start = pivot.getTime() <= clicked.getTime() ? pivot : clicked
      const end = pivot.getTime() <= clicked.getTime() ? clicked : pivot
      departureDate = toISODate(start)
      returnDateStr = toISODate(end)
    } else {
      // Una sola fecha = salida (primera selección)
      departureDate = toISODate(range.from)
    }
    onChange({ departureDate, returnDate: returnDateStr })
  }

  function handleToday() {
    const today = todayISO()
    onChange({
      departureDate: today,
      returnDate: tripType === 'round-trip' ? returnDate || '' : '',
    })
    setMonth(parseDate(today))
  }

  function handleClear() {
    onChange({ departureDate: '', returnDate: '' })
    setMonth(minDate || new Date())
  }

  const popoverContent =
    open && popoverRect ? (
      <div
        ref={popoverRef}
        className={styles.popover}
        role="dialog"
        aria-modal="true"
        aria-label="Choose date range"
        style={{
          position: 'fixed',
          top: popoverRect.top,
          left: popoverRect.left,
          minWidth: Math.max(popoverRect.width, 280),
        }}
      >
        <DayPicker
          mode="range"
          locale={locale}
          selected={selectedRange}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={minDate ? { before: minDate } : undefined}
          numberOfMonths={1}
          formatters={{
            formatCaption: date => date.toLocaleDateString(i18n.language, { month: 'long' }),
          }}
        />
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.todayBtn}
            onClick={handleToday}
            aria-label={todayLabel}
          >
            {todayLabel}
          </button>
          {fromDate && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={handleClear}
              aria-label={clearLabel}
            >
              {clearLabel}
            </button>
          )}
        </div>
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
        aria-label={
          label ? `${label}, ${displayValue || placeholder || 'Select dates'}` : undefined
        }
      >
        <span className={displayValue ? styles.value : styles.placeholder}>
          {displayValue || placeholder || (tripType === 'round-trip' ? 'From – To' : 'Date')}
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
