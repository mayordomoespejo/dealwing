/**
 * Format a price with currency symbol.
 * @param {number} amount
 * @param {string} currency - ISO 4217 code (e.g. "EUR", "USD")
 */
export function formatPrice(amount, currency = 'EUR') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Parse an ISO 8601 duration string (e.g. "PT2H35M") into total minutes.
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
 * Format total flight minutes into a human-readable duration.
 * e.g. 155 → "2h 35m"
 */
export function formatMinutes(totalMinutes) {
  if (!totalMinutes) return '—'
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Format a datetime string to a short time display.
 * e.g. "2025-08-01T09:55:00" → "09:55"
 */
export function formatTime(dateTimeStr) {
  if (!dateTimeStr) return '—'
  const date = new Date(dateTimeStr)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/**
 * Format a datetime string to a date.
 * e.g. "2025-08-01T09:55:00" → "Aug 1"
 */
export function formatDate(dateTimeStr) {
  if (!dateTimeStr) return '—'
  const date = new Date(dateTimeStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Format stops count to human-readable string.
 * e.g. 0 → "Direct", 1 → "1 stop", 2 → "2 stops"
 * Components that need translated output use t('formatters.*') directly.
 */
export function formatStops(stops) {
  if (stops === 0) return 'Direct'
  if (stops === 1) return '1 stop'
  return `${stops} stops`
}

/**
 * Format CO₂ in kg to a readable string.
 * e.g. 245 → "245 kg CO₂"
 */
export function formatCO2(kg) {
  if (!kg) return '—'
  if (kg >= 1000) return `${(kg / 1000).toFixed(1)} t CO₂`
  return `${Math.round(kg)} kg CO₂`
}

/**
 * Converts a numeric deal score into a human-readable label.
 * @param {number} score
 * @returns {string}
 */
export function dealScoreLabel(score) {
  if (score >= 70) return 'Great deal'
  if (score >= 40) return 'Good deal'
  return 'Fair price'
}

/**
 * Format a number of passengers.
 * e.g. 1 → "1 adult", 2 → "2 adults"
 */
export function formatPassengers(count) {
  return `${count} ${count === 1 ? 'adult' : 'adults'}`
}
