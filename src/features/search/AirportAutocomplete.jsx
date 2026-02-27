import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { queryKeys } from '@/lib/queryKeys.js'
import { http } from '@/lib/http.js'
import { useDebounce } from '@/hooks/useDebounce.js'
import { FieldError } from '@/components/ui/FieldError.jsx'
import { XIcon } from '@/icons'
import styles from './AirportAutocomplete.module.css'

const MIN_SEARCH_CHARS = 3

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
 * @param {React.ReactNode} [icon] - leading decorative icon
 * @param {string} [externalLabel] - hydrated display label for controlled values
 * @param {Function} [onLabelChange] - called with the human-readable label of the selected airport
 * @returns {JSX.Element}
 */
export function AirportAutocomplete({
  name,
  value,
  onChange,
  placeholder,
  required,
  error,
  label,
  icon,
  externalLabel = '',
  onLabelChange,
}) {
  const { t } = useTranslation()
  const id = useId()
  const listboxId = `${id}-listbox`
  const inputRef = useRef(null)
  const listRef = useRef(null)

  const [inputText, setInputText] = useState('')
  const [selectedLabel, setSelectedLabel] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const debouncedQuery = useDebounce(inputText, 280)
  const queryTrimmed = debouncedQuery.trim()
  const hasMinChars = queryTrimmed.length >= MIN_SEARCH_CHARS
  const resolvedPlaceholder = placeholder || t('search.cityOrAirport')

  useEffect(() => {
    if (!value) {
      setInputText('')
      setSelectedLabel('')
      return
    }
    if (externalLabel) {
      setSelectedLabel(externalLabel)
    }
  }, [value, externalLabel])

  const {
    data: suggestions = [],
    isError,
    status,
  } = useQuery({
    queryKey: queryKeys.locations.search(debouncedQuery),
    queryFn: async () => {
      if (!hasMinChars) return []
      const res = await http.get('/api/locations', { q: queryTrimmed })
      return res.data ?? []
    },
    enabled: hasMinChars && open,
    staleTime: 1000 * 60 * 60,
  })

  const select = useCallback(
    airport => {
      const displayLabel = airport.cityName || airport.name || airport.iataCode
      onChange(airport.iataCode)
      setSelectedLabel(displayLabel)
      onLabelChange?.(displayLabel)
      setInputText('')
      setOpen(false)
      setActiveIndex(-1)
    },
    [onChange, onLabelChange]
  )

  function handleInputChange(e) {
    const text = e.target.value.toUpperCase()
    setInputText(e.target.value)
    setOpen(true)
    setActiveIndex(-1)
    if (!text) {
      onChange('')
      onLabelChange?.('')
    }
  }

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, -1))
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0) select(suggestions[activeIndex])
      return
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function handleBlur() {
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
          value={value ? inputText || selectedLabel : inputText}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={resolvedPlaceholder}
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
              onLabelChange?.('')
              setInputText('')
              inputRef.current?.focus()
            }}
            aria-label={t('search.clearAirport')}
          >
            <XIcon size={16} />
          </button>
        )}
      </div>

      {!error &&
        open &&
        !value &&
        inputText.trim().length > 0 &&
        inputText.trim().length < MIN_SEARCH_CHARS && (
          <FieldError>{t('search.minCharsAirport')}</FieldError>
        )}

      {!error &&
        open &&
        !value &&
        (isError || (status === 'success' && suggestions.length === 0)) && (
          <FieldError>{t('search.airportSearchError')}</FieldError>
        )}

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={t('search.airportSuggestions', { label: label || name })}
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

      {error && <FieldError>{error}</FieldError>}
    </div>
  )
}
