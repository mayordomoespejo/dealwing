import { describe, it, expect } from 'vitest'
import { formatPrice, parseDurationMinutes, formatDuration } from './formatters.js'

describe('formatPrice', () => {
  it('formats EUR', () => {
    expect(formatPrice(89, 'EUR')).toMatch('89')
    expect(formatPrice(89, 'EUR')).toMatch('€')
  })

  it('formats USD', () => {
    expect(formatPrice(349, 'USD')).toMatch('349')
  })
})

describe('parseDurationMinutes', () => {
  it('parses hours and minutes', () => {
    expect(parseDurationMinutes('PT2H35M')).toBe(155)
  })

  it('parses hours only', () => {
    expect(parseDurationMinutes('PT8H')).toBe(480)
  })

  it('parses minutes only', () => {
    expect(parseDurationMinutes('PT45M')).toBe(45)
  })

  it('returns 0 for empty', () => {
    expect(parseDurationMinutes('')).toBe(0)
    expect(parseDurationMinutes(null)).toBe(0)
  })
})

describe('formatDuration', () => {
  it('formats 2h 35m', () => {
    expect(formatDuration('PT2H35M')).toBe('2h 35m')
  })

  it('formats hours only', () => {
    expect(formatDuration('PT8H')).toBe('8h')
  })

  it('formats minutes only', () => {
    expect(formatDuration('PT45M')).toBe('45m')
  })
})
