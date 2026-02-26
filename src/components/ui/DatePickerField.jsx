import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { DayPicker } from 'react-day-picker'
import { es, enUS } from 'react-day-picker/locale'
import 'react-day-picker/style.css'
import { useTranslation } from 'react-i18next'
import { parseDate, toISODate, formatDisplay } from '@/lib/dateUtils.js'
import { FieldError } from '@/components/ui/FieldError.jsx'
import { CalendarIcon } from '@/icons'
import { CaptionDropdown } from '@/components/ui/DatePickerCaptionDropdown.jsx'
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

  // Year range for dropdown: from min (or this year) to end of next year
  const startMonth = minDate || new Date(new Date().getFullYear(), 0, 1)
  const endMonth = new Date(new Date().getFullYear() + 1, 11, 31)

  // Position popover below trigger
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
          captionLayout="dropdown"
          startMonth={startMonth}
          endMonth={endMonth}
          components={{ Dropdown: CaptionDropdown }}
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
          <CalendarIcon size={18} />
        </span>
      </button>

      {popoverContent && createPortal(popoverContent, document.body)}

      <FieldError>{error}</FieldError>
    </div>
  )
}
