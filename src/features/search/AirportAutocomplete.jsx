import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { searchAirports } from '@/lib/airports.js'
import { queryKeys } from '@/lib/queryKeys.js'
import { http } from '@/lib/http.js'
import styles from './AirportAutocomplete.module.css'

const MOCK = import.meta.env.VITE_MOCK_API === 'true'

/** Debounce hook */
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

/**
 * Airport autocomplete input.
 * Accepts an IATA code as value, shows human-readable label.
 *
 * @param {string}   name        - field name for the form
 * @param {string}   value       - current IATA code (controlled)
 * @param {Function} onChange    - (iata: string) => void
 * @param {string}   placeholder
 * @param {boolean}  required
 * @param {string}   error       - validation error message
 * @param {string}   label
 */
export function AirportAutocomplete({
  name,
  value,
  onChange,
  placeholder = 'City or airport',
  required,
  error,
  label,
  icon,
}) {
  const id = useId()
  const listboxId = `${id}-listbox`
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const [inputText, setInputText] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debouncedQuery = useDebounce(inputText, 280)

  // When value is cleared externally, reset the input text.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!value) setInputText('')
  }, [value])

  // Fetch suggestions from BFF (or local static list in mock mode)
  const { data: suggestions = [] } = useQuery({
    queryKey: queryKeys.locations.search(debouncedQuery),
    queryFn: async () => {
      if (debouncedQuery.length < 1) return []
      if (MOCK) {
        return searchAirports(debouncedQuery, 8).map(a => ({
          iataCode: a.iata,
          name: a.name,
          cityName: a.city,
          countryCode: a.country,
        }))
      }
      const res = await http.get('/api/locations', { q: debouncedQuery })
      return res.data ?? []
    },
    enabled: debouncedQuery.length >= 1 && open,
    staleTime: 1000 * 60 * 60, // 1h — airport names don't change
  })

  const select = useCallback(
    airport => {
      onChange(airport.iataCode)
      setInputText('')
      setOpen(false)
      setActiveIndex(-1)
    },
    [onChange]
  )

  function handleInputChange(e) {
    const text = e.target.value.toUpperCase()
    setInputText(e.target.value)
    setOpen(true)
    setActiveIndex(-1)
    // If user clears, reset value
    if (!text) onChange('')
  }

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (activeIndex >= 0) {
          select(suggestions[activeIndex])
        }
        break
      case 'Escape':
        setOpen(false)
        break
      default:
        break
    }
  }

  function handleBlur() {
    // Delay close to allow click on option
    setTimeout(() => {
      if (!listRef.current?.contains(document.activeElement)) {
        setOpen(false)
      }
    }, 150)
  }

  return (
    <div className={`${styles.wrapper} ${error ? styles.hasError : ''}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}> *</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined}
          className={`${styles.input} ${icon ? styles.withIcon : ''} ${value ? styles.hasValue : ''}`}
          value={value ? inputText || value : inputText}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
          aria-required={required}
          aria-invalid={!!error}
        />
        {value && <span className={styles.iataTag}>{value}</span>}
        {value && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              onChange('')
              setInputText('')
              inputRef.current?.focus()
            }}
            aria-label="Clear airport selection"
          >
            ×
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={`Airport suggestions for ${label || name}`}
            className={styles.dropdown}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            {suggestions.map((airport, i) => (
              <li
                key={airport.iataCode}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                className={`${styles.option} ${i === activeIndex ? styles.optionActive : ''}`}
                onMouseDown={e => {
                  e.preventDefault()
                  select(airport)
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span className={styles.optIata}>{airport.iataCode}</span>
                <span className={styles.optDetails}>
                  <span className={styles.optName}>
                    {airport.address?.cityName || airport.cityName || airport.name}
                  </span>
                  <span className={styles.optAirport}>{airport.name}</span>
                </span>
                <span className={styles.optCountry}>
                  {airport.address?.countryCode || airport.countryCode}
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {error && (
        <span className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
