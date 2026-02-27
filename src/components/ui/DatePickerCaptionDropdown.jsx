/**
 * Custom dropdown for react-day-picker caption (month/year).
 * Renders like the app Select: trigger + list below with same style as Moneda select.
 * Used via DayPicker components={{ Dropdown: CaptionDropdown }}.
 */
import { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from '@/icons'
import styles from './DatePickerCaptionDropdown.module.css'

/**
 * @param {Object} props
 * @param {{ value: number, label: string, disabled: boolean }[]} [props.options]
 * @param {number} [props.value]
 * @param {(e: { target: { value: string } }) => void} [props.onChange]
 * @param {string} [props.name]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {object} [props.components] - from DayPicker (unused, we render our UI)
 * @param {object} [props.classNames] - from DayPicker (unused)
 */
export function CaptionDropdown({
  options = [],
  value,
  onChange,
  name,
  disabled = false,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)

  const selectedOption = options.find(o => o.value === value)
  const displayLabel = selectedOption?.label ?? (selectedOption ? String(selectedOption.value) : '')

  useEffect(() => {
    if (open && options.length > 0) {
      const idx = options.findIndex(o => o.value === value)
      setActiveIndex(idx >= 0 ? idx : 0)
      return
    }
    setActiveIndex(-1)
  }, [open, value, options])

  useEffect(() => {
    if (!open || activeIndex < 0) return
    const optionEl = dropdownRef.current?.querySelector(`[data-option-index="${activeIndex}"]`)
    optionEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [open, activeIndex])

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function openList() {
    if (!disabled && options.length > 0) setOpen(true)
  }

  function handleSelect(optionValue) {
    setOpen(false)
    onChange?.({ target: { value: String(optionValue) } })
  }

  function handleTriggerKeyDown(e) {
    if (disabled) return
    if (e.key === 'ArrowDown' || e.key === 'Down') {
      e.preventDefault()
      if (!open) {
        openList()
        return
      }
      setActiveIndex(i => {
        let next = i < options.length - 1 ? i + 1 : i
        while (next < options.length && options[next]?.disabled) next++
        return Math.min(next, options.length - 1)
      })
      return
    }
    if (e.key === 'ArrowUp' || e.key === 'Up') {
      e.preventDefault()
      if (!open) {
        openList()
        return
      }
      setActiveIndex(i => {
        let prev = i > 0 ? i - 1 : i
        while (prev >= 0 && options[prev]?.disabled) prev--
        return Math.max(prev, 0)
      })
      return
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (open && activeIndex >= 0 && options[activeIndex] && !options[activeIndex].disabled) {
        handleSelect(options[activeIndex].value)
        return
      }
      setOpen(o => !o)
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`.trim()}>
      <button
        type="button"
        name={name}
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={name === 'months' ? 'Month' : 'Year'}
      >
        <span className={styles.triggerValue}>{displayLabel}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">
          <ChevronDownIcon size={16} />
        </span>
      </button>

      {open && (
        <div
          className={styles.dropdown}
          role="listbox"
          aria-label={name === 'months' ? 'Month' : 'Year'}
        >
          <div ref={dropdownRef} className={styles.dropdownInner}>
            {options.map((opt, index) => {
              const isSelected = opt.value === value
              const isActive = index === activeIndex
              return (
                <div
                  key={opt.value}
                  data-option-index={index}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled}
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ''} ${isActive ? styles.optionActive : ''} ${opt.disabled ? styles.optionDisabled : ''}`}
                  onClick={() => !opt.disabled && handleSelect(opt.value)}
                >
                  {opt.label ?? String(opt.value)}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
