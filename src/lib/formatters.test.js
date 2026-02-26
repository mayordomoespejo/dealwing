import { describe, it, expect } from 'vitest'
import {
  formatPrice,
  parseDurationMinutes,
  formatDuration,
  formatStops,
  dealScoreLabel,
} from './formatters.js'

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

describe('formatStops', () => {
  it('returns Direct for 0', () => {
    expect(formatStops(0)).toBe('Direct')
  })
  it('returns "1 stop" for 1', () => {
    expect(formatStops(1)).toBe('1 stop')
  })
  it('returns "2 stops" for 2', () => {
    expect(formatStops(2)).toBe('2 stops')
  })
})

describe('dealScoreLabel', () => {
  it('returns Great deal for high scores', () => {
    expect(dealScoreLabel(80)).toBe('Great deal')
    expect(dealScoreLabel(70)).toBe('Great deal')
  })
  it('returns Good deal for mid scores', () => {
    expect(dealScoreLabel(55)).toBe('Good deal')
  })
  it('returns Fair price for low scores', () => {
    expect(dealScoreLabel(20)).toBe('Fair price')
  })
})
