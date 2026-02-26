import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker } from 'react-day-picker'
import { es, enUS } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { useTranslation } from 'react-i18next'
import { parseDate, toISODate, formatDisplay, todayISO } from '@/lib/dateUtils.js'
import { FieldError } from '@/components/ui/FieldError.jsx'
import { CalendarIcon } from '@/icons'
import { CaptionDropdown } from '@/components/ui/DatePickerCaptionDropdown.jsx'
import styles from './DateRangePickerField.module.css'

/**
 * Single input for departure + return date range.
 * - One trigger showing "from – to" or "from" for one-way.
 * - Calendar in range mode with a "Today" shortcut.
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
 * @param {string}   [todayLabel]   - e.g. "Today"
 * @param {string}   [clearLabel]   - e.g. "Clear"
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
    const parsedDepartureDate = parseDate(departureDate)
    const parsedMinDate = parseDate(min)

    if (parsedDepartureDate) setMonth(parsedDepartureDate)
    else if (parsedMinDate) setMonth(parsedMinDate)
    else setMonth(new Date())
    // Depend on string props so we don't get new Date() refs on every render (infinite loop)
  }, [departureDate, min])

  const startMonth = minDate || new Date(new Date().getFullYear(), 0, 1)
  const endMonth = new Date(new Date().getFullYear() + 1, 11, 31)

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
      const start = range.from.getTime() <= range.to.getTime() ? range.from : range.to
      const end = range.from.getTime() <= range.to.getTime() ? range.to : range.from
      departureDate = toISODate(start)
      returnDateStr = toISODate(end)
    } else if (hasExistingRange && !range.to) {
      const pivot = toDate
      const clicked = range.from
      const start = pivot.getTime() <= clicked.getTime() ? pivot : clicked
      const end = pivot.getTime() <= clicked.getTime() ? clicked : pivot
      departureDate = toISODate(start)
      returnDateStr = toISODate(end)
    } else {
      const dateToUse = tripType === 'one-way' && range.to ? range.to : range.from
      departureDate = toISODate(dateToUse)
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
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          components={{ Dropdown: CaptionDropdown }}
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
          <CalendarIcon size={18} />
        </span>
      </button>

      {popoverContent && createPortal(popoverContent, document.body)}

      <FieldError>{error}</FieldError>
    </div>
  )
}
