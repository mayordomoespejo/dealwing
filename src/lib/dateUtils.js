/**
 * Shared date helpers for date picker components.
 */
import i18n from './i18n.js'

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
 * Format date for display: "27 feb 2026" / "27 Aug 2026"
 * Always day-first, abbreviated month, with year.
 */
export function formatDisplay(date) {
  if (!date || !(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  const day = date.getDate()
  const month = date.toLocaleString(i18n.language, { month: 'short' })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

/** Today as YYYY-MM-DD in local time. */
export function todayISO() {
  return toISODate(new Date())
}
