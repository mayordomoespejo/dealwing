import { useRef, useState, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getSearchSchema, defaultValues } from './schema.js'
import { AirportAutocomplete } from './AirportAutocomplete.jsx'
import { useSearchHistory } from './useSearchHistory.js'
import { Button } from '@/components/ui/Button.jsx'
import { DateRangePickerField } from '@/components/ui/DateRangePickerField.jsx'
import { FieldError } from '@/components/ui/FieldError.jsx'
import { formatDate } from '@/lib/formatters.js'
import { useKeyboard } from '@/hooks/useKeyboard.js'
import {
  PaperPlaneIcon,
  TakeoffIcon,
  LandingIcon,
  SwapIcon,
  ClockIcon,
  PlusIcon,
  MinusIcon,
  XIcon,
} from '@/icons'
import styles from './SearchForm.module.css'

const MIN_ADULTS = 1
const MAX_ADULTS = 9
const clampAdults = v =>
  Math.min(MAX_ADULTS, Math.max(MIN_ADULTS, isNaN(v) ? MIN_ADULTS : Math.floor(Number(v))))

/**
 * Counter with editable input: local state while typing so user can enter any number 1–9.
 * Shows error when user tries to go below 1 or above 9 (typing 0/10+ or clicking - at 1 / + at 9).
 */
function AdultsCounter({
  value,
  onChange,
  id,
  label,
  styles: css,
  error,
  validationMessage,
  onClearError,
}) {
  const [inputStr, setInputStr] = useState(null)
  const [attemptError, setAttemptError] = useState(false)
  const inputRef = useRef(null)
  const displayValue = inputStr !== null ? inputStr : String(value)
  const displayError = error || (attemptError ? validationMessage : null)

  const commit = next => {
    const n = clampAdults(next)
    onChange(n)
    setInputStr(null)
    setAttemptError(false)
  }

  // Al hacer clic en el contenedor (no en + ni -), activar el input para escribir
  // Solo activar el input al hacer clic en el contenedor, no al pulsar - o + (ni en su área/icono)
  const handleContainerClick = e => {
    if (e.target.closest('button')) return
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
    inputRef.current?.focus()
  }

  const handleChange = e => {
    const raw = e.target.value
    if (raw === '') {
      setInputStr('')
      setAttemptError(false)
      return
    }
    const digits = raw.replace(/\D/g, '').slice(0, 2)
    if (digits === '') {
      setInputStr('')
      setAttemptError(true)
      return
    }
    setInputStr(digits)
    const num = parseInt(digits, 10)
    if (num >= 1 && num <= 9) {
      setAttemptError(false)
      onChange(num)
    } else {
      setAttemptError(true)
      // No actualizar value; el usuario ve el número inválido y el mensaje de error
    }
  }

  const handleBlur = () => {
    setAttemptError(false)
    if (inputStr === '' || inputStr === null) {
      commit(MIN_ADULTS)
      onClearError?.()
      return
    }
    const n = parseInt(inputStr, 10)
    const finalN = isNaN(n) ? MIN_ADULTS : n
    commit(finalN)
    // Si el valor final está entre 1 y 9, quitar el error del formulario al perder el foco
    if (finalN >= MIN_ADULTS && finalN <= MAX_ADULTS) {
      onClearError?.()
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.target.blur()
      return
    }
    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1 && !/\d/.test(e.key)) {
      e.preventDefault()
      setAttemptError(true)
    }
  }

  const handleDecrement = () => {
    if (value <= MIN_ADULTS) {
      setAttemptError(true)
      return
    }
    commit(value - 1)
  }

  const handleIncrement = () => {
    if (value >= MAX_ADULTS) {
      setAttemptError(true)
      return
    }
    commit(value + 1)
  }

  return (
    <div className={css.extrasFieldRelative}>
      <div
        className={`${css.counter} ${displayError ? css.counterError : ''}`.trim()}
        onClick={handleContainerClick}
        role="group"
        aria-label={label}
      >
        <button
          type="button"
          className={css.counterBtn}
          onClick={e => {
            e.stopPropagation()
            handleDecrement()
          }}
          aria-label="Decrease adults"
        >
          <MinusIcon size={16} />
        </button>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[1-9]"
          maxLength={2}
          id={id}
          aria-label={label}
          aria-invalid={!!displayError}
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
          onClick={e => {
            e.stopPropagation()
            handleIncrement()
          }}
          aria-label="Increase adults"
        >
          <PlusIcon size={16} />
        </button>
      </div>
      <FieldError>{displayError}</FieldError>
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
  const { history, addSearch, clearHistory, removeEntry } = useSearchHistory()
  const [originLabel, setOriginLabel] = useState('')
  const [destinationLabel, setDestinationLabel] = useState('')

  // Schema con mensajes traducidos; se recalcula al cambiar idioma
  const searchSchema = useMemo(() => getSearchSchema(t), [t])

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
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
    addSearch({ ...data, originLabel, destinationLabel })
    onSearch(data)
  }

  function swapAirports() {
    const currentOrigin = origin
    const currentDest = destination
    const currentOriginLabel = originLabel
    const currentDestLabel = destinationLabel
    setValue('origin', currentDest || '')
    setValue('destination', currentOrigin || '')
    setOriginLabel(currentDestLabel)
    setDestinationLabel(currentOriginLabel)
  }

  function loadFromHistory(entry) {
    setValue('origin', entry.origin)
    setValue('destination', entry.destination || '')
    setValue('departureDate', entry.departureDate)
    setValue('returnDate', entry.returnDate || '')
    setValue('adults', entry.adults)
    setValue('tripType', entry.tripType ?? 'round-trip')
    setOriginLabel(entry.originLabel || entry.origin)
    setDestinationLabel(entry.destinationLabel || entry.destination || '')
    clearErrors()
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
            <SwapIcon size={16} />
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
                  icon={<TakeoffIcon size={16} />}
                  externalLabel={originLabel}
                  onLabelChange={setOriginLabel}
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
                  icon={<LandingIcon size={16} />}
                  externalLabel={destinationLabel}
                  onLabelChange={setDestinationLabel}
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

        {/* Passengers + Submit row: 1/3 pasajeros, 2/3 botón */}
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
                  error={errors.adults?.message}
                  validationMessage={t('search.validation.adultsRange')}
                  onClearError={() => clearErrors('adults')}
                  styles={styles}
                />
              )}
            />
          </div>
          <div className={styles.extrasButtonWrap}>
            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={loading || isSubmitting}
              icon={<PaperPlaneIcon size={20} variant="inverse" />}
            >
              {t('search.searchFlights')}
            </Button>
          </div>
        </div>
      </form>

      {/* Search history */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.div className={styles.history} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className={styles.historyHeader}>
              <span className={styles.historyTitle}>
                <ClockIcon size={12} />
                {t('search.recentSearches')}
              </span>
              <button className={styles.clearBtn} onClick={clearHistory}>
                {t('search.clearAll')}
              </button>
            </div>
            <div className={styles.historyList}>
              {history.slice(0, 5).map(entry => (
                <div key={entry.id} className={styles.historyItemRow}>
                  <button
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
                  <button
                    type="button"
                    className={styles.historyItemRemove}
                    onClick={e => {
                      e.stopPropagation()
                      removeEntry(entry.id)
                    }}
                    aria-label={t('search.removeSearch')}
                  >
                    <XIcon size={16} />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
