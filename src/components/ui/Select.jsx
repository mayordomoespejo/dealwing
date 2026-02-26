import { useState, useRef, useEffect } from 'react'
import styles from './Select.module.css'

/**
 * Custom select: trigger with padding, dropdown below (not over), chevron rotates when open.
 * Keyboard: ArrowDown/Up to move, Enter to select, Escape to close.
 * @param {string}          id
 * @param {string}          value       - current value
 * @param {Function}        onChange    - (value: string) => void
 * @param {Array<{value: string, label?: string}>} options
 * @param {string}          [className]
 * @param {boolean}         [disabled]
 */
export function Select({ id, value, onChange, options, className = '', disabled = false }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)

  const selectedOption = options.find(o => o.value === value)
  const displayLabel = selectedOption?.label ?? selectedOption?.value ?? value

  // When opening, set active index to current value or 0
  useEffect(() => {
    if (open && options.length > 0) {
      const idx = options.findIndex(o => o.value === value)
      setActiveIndex(idx >= 0 ? idx : 0)
    } else {
      setActiveIndex(-1)
    }
  }, [open, value, options])

  // Scroll active option into view when activeIndex changes
  useEffect(() => {
    if (!open || activeIndex < 0) return
    const optionEl = dropdownRef.current?.querySelector(`[data-option-index="${activeIndex}"]`)
    optionEl?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [open, activeIndex])

  // Close on click outside
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
    onChange(optionValue)
    setOpen(false)
  }

  function handleTriggerKeyDown(e) {
    if (disabled) return
    switch (e.key) {
      case 'ArrowDown':
      case 'Down': {
        e.preventDefault()
        if (!open) {
          openList()
          return
        }
        setActiveIndex(i => (i < options.length - 1 ? i + 1 : i))
        break
      }
      case 'ArrowUp':
      case 'Up': {
        e.preventDefault()
        if (!open) {
          openList()
          return
        }
        setActiveIndex(i => (i > 0 ? i - 1 : i))
        break
      }
      case 'Enter':
      case ' ': {
        e.preventDefault()
        if (open && activeIndex >= 0 && options[activeIndex]) {
          handleSelect(options[activeIndex].value)
        } else {
          setOpen(o => !o)
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        setOpen(false)
        break
      }
      case 'Home': {
        if (open) {
          e.preventDefault()
          setActiveIndex(0)
        }
        break
      }
      case 'End': {
        if (open) {
          e.preventDefault()
          setActiveIndex(options.length - 1)
        }
        break
      }
      default:
        break
    }
  }

  const activeValue = activeIndex >= 0 && options[activeIndex] ? options[activeIndex].value : null

  return (
    <div ref={containerRef} className={`${styles.container} ${className}`.trim()}>
      <button
        type="button"
        id={id}
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={id ? `${id}-label` : undefined}
        aria-activedescendant={open && activeValue ? `${id}-option-${activeValue}` : undefined}
      >
        <span className={styles.triggerValue}>{displayLabel}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`} aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className={styles.dropdown}
          role="listbox"
          aria-activedescendant={activeValue ? `${id}-option-${activeValue}` : undefined}
          id={id ? `${id}-listbox` : undefined}
        >
          {options.map((opt, index) => (
            <div
              key={opt.value}
              id={id ? `${id}-option-${opt.value}` : undefined}
              data-option-index={index}
              role="option"
              aria-selected={opt.value === value}
              className={`${styles.option} ${opt.value === value ? styles.optionSelected : ''} ${index === activeIndex ? styles.optionActive : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label ?? opt.value}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
