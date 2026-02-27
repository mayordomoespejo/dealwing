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

const CALENDAR_WIDTH = 280

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
  todayLabel,
  clearLabel,
}) {
  const { i18n, t } = useTranslation()
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

    if (parsedDepartureDate) {
      setMonth(parsedDepartureDate)
      return
    }
    if (parsedMinDate) {
      setMonth(parsedMinDate)
      return
    }
    setMonth(new Date())
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
      if (!popoverRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function handleSelectSingle(date) {
    if (!date) return
    onChange({ departureDate: toISODate(date), returnDate: '' })
  }

  function handleSelectRange(range) {
    if (!range?.from) return
    const hasExistingRange = fromDate && toDate

    if (range.to) {
      const start = range.from.getTime() <= range.to.getTime() ? range.from : range.to
      const end = range.from.getTime() <= range.to.getTime() ? range.to : range.from
      onChange({ departureDate: toISODate(start), returnDate: toISODate(end) })
      return
    }
    if (hasExistingRange) {
      const pivot = toDate
      const clicked = range.from
      const start = pivot.getTime() <= clicked.getTime() ? pivot : clicked
      const end = pivot.getTime() <= clicked.getTime() ? clicked : pivot
      onChange({ departureDate: toISODate(start), returnDate: toISODate(end) })
      return
    }
    onChange({ departureDate: toISODate(range.from), returnDate: '' })
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

  function handleDone() {
    setOpen(false)
  }

  const resolvedTodayLabel = todayLabel || t('search.today')
  const resolvedClearLabel = clearLabel || t('search.clearDates')
  const resolvedDoneLabel = t('search.done')
  const fallbackPlaceholder =
    placeholder ||
    (tripType === 'round-trip'
      ? t('search.datePlaceholderRange')
      : t('search.datePlaceholderSingle'))
  const dayPickerProps = {
    locale,
    month,
    onMonthChange: setMonth,
    disabled: minDate ? { before: minDate } : undefined,
    numberOfMonths: 1,
    captionLayout: 'dropdown',
    startMonth,
    endMonth,
    components: { Dropdown: CaptionDropdown },
    formatters: {
      formatCaption: date => date.toLocaleDateString(i18n.language, { month: 'long' }),
    },
  }

  const popoverContent =
    open && popoverRect ? (
      <div
        ref={popoverRef}
        className={styles.popover}
        role="dialog"
        aria-modal="true"
        aria-label={t('search.datePickerAriaLabel')}
        style={{
          position: 'fixed',
          top: popoverRect.top,
          left: popoverRect.left,
          width: popoverRect.width,
          maxWidth: popoverRect.width,
        }}
      >
        <div
          className={styles.popoverInner}
          style={{
            transform: `scale(${Math.min(1, popoverRect.width / CALENDAR_WIDTH)})`,
            transformOrigin: 'top center',
          }}
        >
          {tripType === 'one-way' ? (
            <DayPicker
              mode="single"
              selected={fromDate || undefined}
              onSelect={handleSelectSingle}
              {...dayPickerProps}
            />
          ) : (
            <DayPicker
              mode="range"
              selected={selectedRange}
              onSelect={handleSelectRange}
              {...dayPickerProps}
            />
          )}
          <div className={styles.footer}>
            <div className={styles.footerActions}>
              <button
                type="button"
                className={styles.todayBtn}
                onClick={handleToday}
                aria-label={resolvedTodayLabel}
              >
                {resolvedTodayLabel}
              </button>
            </div>
            <div className={styles.footerSecondaryActions}>
              {fromDate && (
                <>
                  <button
                    type="button"
                    className={styles.clearBtn}
                    onClick={handleClear}
                    aria-label={resolvedClearLabel}
                  >
                    {resolvedClearLabel}
                  </button>
                  <span className={styles.footerDivider} aria-hidden="true">
                    |
                  </span>
                </>
              )}
              <button
                type="button"
                className={styles.doneBtn}
                onClick={handleDone}
                aria-label={resolvedDoneLabel}
              >
                {resolvedDoneLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null

  return (
    <div className={`${styles.wrapper} ${className}`.trim()} onMouseDown={e => e.stopPropagation()}>
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
        aria-label={label ? `${label}, ${displayValue || fallbackPlaceholder}` : undefined}
      >
        <span className={displayValue ? styles.value : styles.placeholder}>
          {displayValue || fallbackPlaceholder}
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
