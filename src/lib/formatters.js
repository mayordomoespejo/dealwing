import i18n from './i18n.js'

/**
 * Format a price with currency symbol.
 * @param {number} amount
 * @param {string} currency - ISO 4217 code (e.g. "EUR", "USD")
 * @returns {string}
 */
export function formatPrice(amount, currency = 'EUR') {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Parse an ISO 8601 duration string (e.g. "PT2H35M") into total minutes.
 * @param {string | null | undefined} isoDuration
 * @returns {number}
 */
export function parseDurationMinutes(isoDuration) {
  if (!isoDuration) return 0
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return 0
  const hours = parseInt(match[1] ?? 0, 10)
  const minutes = parseInt(match[2] ?? 0, 10)
  return hours * 60 + minutes
}

/**
 * Format an ISO 8601 duration string as a human-readable string.
 * e.g. "PT2H35M" → "2h 35m"
 * @param {string | null | undefined} isoDuration
 * @returns {string}
 */
export function formatDuration(isoDuration) {
  const total = parseDurationMinutes(isoDuration)
  if (total === 0) return '—'
  const h = Math.floor(total / 60)
  const m = total % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Format a datetime string to a short time display.
 * e.g. "2025-08-01T09:55:00" → "09:55"
 * @param {string | null | undefined} dateTimeStr
 * @returns {string}
 */
export function formatTime(dateTimeStr) {
  if (!dateTimeStr) return '—'
  const date = new Date(dateTimeStr)
  return date.toLocaleTimeString(i18n.language, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * Format a datetime string to a date.
 * e.g. "2025-08-01T09:55:00" → "Aug 1"
 * @param {string | null | undefined} dateTimeStr
 * @returns {string}
 */
export function formatDate(dateTimeStr) {
  if (!dateTimeStr) return '—'
  const date = new Date(dateTimeStr)
  return date.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })
}

/**
 * Format CO₂ in kg to a readable string.
 * e.g. 245 → "245 kg CO₂"
 * @param {number | null | undefined} kg
 * @returns {string}
 */
export function formatCO2(kg) {
  if (!kg) return '—'
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t CO₂`
  return `${Math.round(kg)} kg CO₂`
}
