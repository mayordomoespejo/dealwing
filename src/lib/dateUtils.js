/**
 * Shared date helpers for date picker components.
 */

/**
 * Converts YYYY-MM-DD string to Date at noon local to avoid timezone shifts.
 */
export function parseDate(str) {
  if (!str || typeof str !== 'string') return undefined
  const [y, m, d] = str.split('-').map(Number)
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return undefined
  return new Date(y, m - 1, d)
}

/**
 * Converts Date to YYYY-MM-DD string.
 */
export function toISODate(date) {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Format date for display (locale string).
 */
export function formatDisplay(date) {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Today as YYYY-MM-DD in local time. */
export function todayISO() {
  return toISODate(new Date())
}
