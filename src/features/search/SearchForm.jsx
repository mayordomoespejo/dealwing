import { useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { searchSchema, defaultValues } from './schema.js'
import { AirportAutocomplete } from './AirportAutocomplete.jsx'
import { useSearchHistory } from './useSearchHistory.js'
import { Button } from '@/components/ui/Button.jsx'
import { DateRangePickerField } from '@/components/ui/DateRangePickerField.jsx'
import { Select } from '@/components/ui/Select.jsx'
import { formatDate } from '@/lib/formatters.js'
import { useKeyboard } from '@/hooks/useKeyboard.js'
import { PaperPlaneIcon } from '@/icons'
import styles from './SearchForm.module.css'

const PlaneIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-1 1-.1.6.2 1.2.7 1.5L6.7 12l-3.3 3.5A1 1 0 0 0 4 17l1 .5.5 1c.2.3.5.5.8.6.4 0 .7-.2 1-.4L10.5 16l4.3 4.2c.3.3.7.5 1.2.4.6-.1 1-.5 1.1-1l.7-1.4Z" />
  </svg>
)

const MIN_ADULTS = 1
const MAX_ADULTS = 9
const clampAdults = v =>
  Math.min(MAX_ADULTS, Math.max(MIN_ADULTS, isNaN(v) ? MIN_ADULTS : Math.floor(Number(v))))

/**
 * Counter with editable input: local state while typing so user can enter any number 1–9.
 */
function AdultsCounter({ value, onChange, id, label, styles: css }) {
  const [inputStr, setInputStr] = useState(null)
  const displayValue = inputStr !== null ? inputStr : String(value)

  const commit = next => {
    const n = clampAdults(next)
    onChange(n)
    setInputStr(null)
  }

  const handleChange = e => {
    const raw = e.target.value
    if (raw === '') {
      setInputStr('')
      return
    }
    // Solo un dígito entre 1 y 9 (bloquea 0 y números de dos cifras por teclado)
    const allowed = raw.replace(/[^1-9]/g, '').slice(0, 1)
    if (allowed === '') {
      setInputStr('')
      return
    }
    setInputStr(allowed)
    onChange(parseInt(allowed, 10))
  }

  const handleBlur = () => {
    if (inputStr === '' || inputStr === null) {
      commit(MIN_ADULTS)
      return
    }
    const n = parseInt(inputStr, 10)
    commit(isNaN(n) ? MIN_ADULTS : n)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.target.blur()
      return
    }
    // Bloquear 0 y cualquier carácter que no sea 1-9 al escribir
    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1 && !/[1-9]/.test(e.key)) {
      e.preventDefault()
    }
  }

  return (
    <div className={css.counter}>
      <button
        type="button"
        className={css.counterBtn}
        onClick={() => commit(value - 1)}
        aria-label="Decrease adults"
        disabled={value <= MIN_ADULTS}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[1-9]"
        maxLength={1}
        id={id}
        aria-label={label}
        className={css.counterInput}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onFocus={() => setInputStr(displayValue)}
      />
      <button
        type="button"
        className={css.counterBtn}
        onClick={() => commit(value + 1)}
        aria-label="Increase adults"
        disabled={value >= MAX_ADULTS}
      >
        +
      </button>
    </div>
  )
}

/**
 * Main flight search form.
 * @param {Function} onSearch - called with validated search params on submit
 * @param {boolean}  loading  - shows spinner on submit button
 */
export function SearchForm({ onSearch, loading }) {
  const { t } = useTranslation()
  const originInputRef = useRef(null)
  const { history, addSearch, clearHistory } = useSearchHistory()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(searchSchema),
    defaultValues,
    mode: 'onSubmit',
  })

  const tripType = watch('tripType')
  const origin = watch('origin')
  const destination = watch('destination')

  // Keyboard shortcut: "/" focuses origin input
  useKeyboard('/', e => {
    e.preventDefault()
    originInputRef.current?.querySelector('input')?.focus()
  })

  function onValid(data) {
    addSearch(data)
    onSearch(data)
  }

  function swapAirports() {
    const currentOrigin = origin
    const currentDest = destination
    setValue('origin', currentDest || '')
    setValue('destination', currentOrigin || '')
  }

  function loadFromHistory(entry) {
    setValue('origin', entry.origin)
    setValue('destination', entry.destination || '')
    setValue('departureDate', entry.departureDate)
    setValue('returnDate', entry.returnDate || '')
    setValue('adults', entry.adults)
    setValue('tripType', entry.tripType ?? 'round-trip')
    setValue('currency', entry.currency ?? 'EUR')
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit(onValid)} noValidate>
        {/* Trip type toggle + swap button */}
        <div className={styles.tripTypeRow}>
          <Controller
            name="tripType"
            control={control}
            render={({ field }) => (
              <div className={styles.segmented} role="group" aria-label={t('search.tripType')}>
                {['round-trip', 'one-way'].map(type => (
                  <label
                    key={type}
                    className={`${styles.segItem} ${field.value === type ? styles.segActive : ''}`}
                  >
                    <input
                      type="radio"
                      className="sr-only"
                      value={type}
                      checked={field.value === type}
                      onChange={() => {
                        field.onChange(type)
                        if (type === 'one-way') setValue('returnDate', '')
                      }}
                    />
                    {type === 'round-trip' ? t('search.roundTrip') : t('search.oneWay')}
                  </label>
                ))}
              </div>
            )}
          />
          <button
            type="button"
            className={styles.swapBtn}
            onClick={swapAirports}
            aria-label={t('search.swapAirports')}
            disabled={!origin && !destination}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M7 16V4m0 0L3 8m4-4 4 4" />
              <path d="M17 8v12m0 0 4-4m-4 4-4-4" />
            </svg>
          </button>
        </div>

        {/* Origin / Destination row */}
        <div className={styles.airportsRow}>
          <div ref={originInputRef} className={styles.airportField}>
            <Controller
              name="origin"
              control={control}
              render={({ field }) => (
                <AirportAutocomplete
                  name="origin"
                  label={t('search.from')}
                  required
                  value={field.value}
                  onChange={val => field.onChange(val)}
                  placeholder={t('search.cityOrAirport')}
                  error={errors.origin?.message}
                  icon={<PlaneIcon />}
                />
              )}
            />
          </div>

          <div className={styles.airportField}>
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <AirportAutocomplete
                  name="destination"
                  label={t('search.to')}
                  value={field.value || ''}
                  onChange={val => field.onChange(val)}
                  placeholder={t('search.anyDestination')}
                  error={errors.destination?.message}
                  icon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  }
                />
              )}
            />
          </div>
        </div>

        {/* Dates: single range input (departure – return or just departure for one-way) */}
        <div className={styles.datesRow}>
          <div className={styles.dateFieldFull}>
            <DateRangePickerField
              id="dateRange"
              label={t('search.dates')}
              value={{
                departureDate: watch('departureDate'),
                returnDate: watch('returnDate') || '',
              }}
              onChange={({ departureDate, returnDate }) => {
                setValue('departureDate', departureDate)
                setValue('returnDate', returnDate ?? '')
              }}
              min={new Date().toISOString().slice(0, 10)}
              tripType={tripType}
              error={errors.departureDate?.message || errors.returnDate?.message}
              placeholder={
                tripType === 'round-trip'
                  ? t('search.datePlaceholderRange')
                  : t('search.datePlaceholderSingle')
              }
              todayLabel={t('search.today')}
              clearLabel={t('search.clearDates')}
              className={styles.dateInputWrapper}
            />
          </div>
        </div>

        {/* Passengers + Currency row */}
        <div className={styles.extrasRow}>
          <div className={styles.extrasField}>
            <label className={styles.fieldLabel} htmlFor="adults">
              {t('search.adults')}
            </label>
            <Controller
              name="adults"
              control={control}
              render={({ field }) => (
                <AdultsCounter
                  id="adults"
                  label={t('search.adults')}
                  value={field.value}
                  onChange={field.onChange}
                  styles={styles}
                />
              )}
            />
          </div>

          <div className={styles.extrasField}>
            <label className={styles.fieldLabel} id="currency-label" htmlFor="currency">
              {t('search.currency')}
            </label>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <Select
                  id="currency"
                  value={field.value}
                  onChange={val => field.onChange(val)}
                  options={['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'].map(c => ({
                    value: c,
                  }))}
                />
              )}
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={loading || isSubmitting}
          icon={<PaperPlaneIcon size={20} variant="inverse" />}
        >
          {t('search.searchFlights')}
        </Button>
      </form>

      {/* Search history */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.div className={styles.history} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.historyHeader}>
              <span className={styles.historyTitle}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
                {t('search.recentSearches')}
              </span>
              <button className={styles.clearBtn} onClick={clearHistory}>
                {t('search.clearAll')}
              </button>
            </div>
            <div className={styles.historyList}>
              {history.slice(0, 5).map(entry => (
                <button
                  key={entry.id}
                  type="button"
                  className={styles.historyItem}
                  onClick={() => loadFromHistory(entry)}
                >
                  <span className={styles.historyRoute}>
                    {entry.origin}
                    {entry.destination ? ` → ${entry.destination}` : ` → ${t('search.anywhere')}`}
                  </span>
                  <span className={styles.historyDate}>
                    {formatDate(entry.departureDate)}
                    {entry.returnDate ? ` – ${formatDate(entry.returnDate)}` : ''}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
