import { useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { searchSchema, defaultValues } from './schema.js'
import { AirportAutocomplete } from './AirportAutocomplete.jsx'
import { useSearchHistory } from './useSearchHistory.js'
import { Button } from '@/components/ui/Button.jsx'
import { formatDate } from '@/lib/formatters.js'
import { useKeyboard } from '@/hooks/useKeyboard.js'
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

/**
 * Main flight search form.
 * @param {Function} onSearch - called with validated search params on submit
 * @param {boolean}  loading  - shows spinner on submit button
 */
export function SearchForm({ onSearch, loading }) {
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
        {/* Trip type toggle */}
        <div className={styles.tripTypeRow}>
          <Controller
            name="tripType"
            control={control}
            render={({ field }) => (
              <div className={styles.segmented} role="group" aria-label="Trip type">
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
                    {type === 'round-trip' ? 'Round trip' : 'One way'}
                  </label>
                ))}
              </div>
            )}
          />
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
                  label="From"
                  required
                  value={field.value}
                  onChange={val => field.onChange(val)}
                  placeholder="City or airport"
                  error={errors.origin?.message}
                  icon={<PlaneIcon />}
                />
              )}
            />
          </div>

          <button
            type="button"
            className={styles.swapBtn}
            onClick={swapAirports}
            aria-label="Swap origin and destination"
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

          <div className={styles.airportField}>
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <AirportAutocomplete
                  name="destination"
                  label="To"
                  value={field.value || ''}
                  onChange={val => field.onChange(val)}
                  placeholder="Any destination"
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

        {/* Dates row */}
        <div className={styles.datesRow}>
          <div className={styles.dateField}>
            <label className={styles.fieldLabel} htmlFor="departureDate">
              Departure
            </label>
            <Controller
              name="departureDate"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  id="departureDate"
                  type="date"
                  className={`${styles.dateInput} ${errors.departureDate ? styles.inputError : ''}`}
                  min={new Date().toISOString().slice(0, 10)}
                />
              )}
            />
            {errors.departureDate && (
              <span className={styles.fieldError}>{errors.departureDate.message}</span>
            )}
          </div>

          <AnimatePresence>
            {tripType === 'round-trip' && (
              <motion.div
                className={styles.dateField}
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className={styles.fieldLabel} htmlFor="returnDate">
                  Return
                </label>
                <Controller
                  name="returnDate"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      id="returnDate"
                      type="date"
                      className={`${styles.dateInput} ${errors.returnDate ? styles.inputError : ''}`}
                      min={watch('departureDate') || new Date().toISOString().slice(0, 10)}
                    />
                  )}
                />
                {errors.returnDate && (
                  <span className={styles.fieldError}>{errors.returnDate.message}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Passengers + Currency row */}
        <div className={styles.extrasRow}>
          <div className={styles.extrasField}>
            <label className={styles.fieldLabel} htmlFor="adults">
              Adults
            </label>
            <Controller
              name="adults"
              control={control}
              render={({ field }) => (
                <div className={styles.counter}>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => field.onChange(Math.max(1, field.value - 1))}
                    aria-label="Decrease adults"
                    disabled={field.value <= 1}
                  >
                    −
                  </button>
                  <span className={styles.counterValue}>{field.value}</span>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => field.onChange(Math.min(9, field.value + 1))}
                    aria-label="Increase adults"
                    disabled={field.value >= 9}
                  >
                    +
                  </button>
                </div>
              )}
            />
          </div>

          <div className={styles.extrasField}>
            <label className={styles.fieldLabel} htmlFor="currency">
              Currency
            </label>
            <Controller
              name="currency"
              control={control}
              render={({ field }) => (
                <select {...field} id="currency" className={styles.select}>
                  {['EUR', 'USD', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF'].map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
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
          icon={<PlaneIcon />}
        >
          Search flights
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
                Recent searches
              </span>
              <button className={styles.clearBtn} onClick={clearHistory}>
                Clear all
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
                    {entry.destination ? ` → ${entry.destination}` : ' → Anywhere'}
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
