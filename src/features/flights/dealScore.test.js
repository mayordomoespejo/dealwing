import { describe, it, expect } from 'vitest'
import { computeDealScore, computePriceStats } from './dealScore.js'

const mockOffer = (price, durationMin, stops) => ({
  price,
  totalDurationMin: durationMin,
  stops,
})

describe('computeDealScore', () => {
  const context = { maxPrice: 500, maxDuration: 600 }

  it('cheapest direct flight scores highest', () => {
    const score = computeDealScore(mockOffer(100, 120, 0), context)
    expect(score).toBeGreaterThan(70)
  })

  it('most expensive long flight scores lowest', () => {
    const score = computeDealScore(mockOffer(500, 600, 2), context)
    expect(score).toBe(0)
  })

  it('score is in range 0-100', () => {
    const score = computeDealScore(mockOffer(250, 300, 1), context)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('returns 50 when maxPrice is 0', () => {
    expect(computeDealScore(mockOffer(100, 120, 0), { maxPrice: 0, maxDuration: 120 })).toBe(50)
  })
})

describe('computePriceStats', () => {
  const offers = [
    mockOffer(100, 120, 0),
    mockOffer(200, 180, 1),
    mockOffer(300, 240, 0),
    mockOffer(400, 300, 2),
  ]

  it('computes min correctly', () => {
    expect(computePriceStats(offers).min).toBe(100)
  })

  it('computes max correctly', () => {
    expect(computePriceStats(offers).max).toBe(400)
  })

  it('computes mean correctly', () => {
    expect(computePriceStats(offers).mean).toBe(250)
  })

  it('returns zeros for empty array', () => {
    const stats = computePriceStats([])
    expect(stats.min).toBe(0)
    expect(stats.max).toBe(0)
  })
})
