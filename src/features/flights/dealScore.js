/**
 * Deal Score — 0 to 100.
 *
 * Formula:
 *   60% weight → price (cheaper = better)
 *   30% weight → duration (shorter = better)
 *   10% weight → stops (direct = best)
 *
 * Each component is normalized to [0, 1] relative to the result set.
 */

/**
 * Compute deal score for a single offer relative to all offers in the set.
 * @param {object} offer       - domain FlightOffer
 * @param {object} context     - { maxPrice, maxDuration } from the full result set
 * @returns {number}           - 0–100 integer
 */
export function computeDealScore(offer, { maxPrice, maxDuration }) {
  if (!maxPrice || maxPrice === 0) return 50

  // Price component: 0 (expensive) → 1 (cheapest)
  const priceScore = maxPrice > 0 ? 1 - offer.price / maxPrice : 0

  // Duration component: 0 (longest) → 1 (shortest)
  const durationScore = maxDuration > 0 ? 1 - offer.totalDurationMin / maxDuration : 0

  // Stops component: direct=1, 1stop=0.5, 2+stops=0
  const stopsScore = offer.stops === 0 ? 1 : offer.stops === 1 ? 0.5 : 0

  const raw = priceScore * 60 + durationScore * 30 + stopsScore * 10
  return Math.round(Math.min(100, Math.max(0, raw)))
}

/**
 * Compute price statistics for a list of offers.
 * Returns { min, median, max, mean } in the offer's currency.
 */
export function computePriceStats(offers) {
  if (!offers.length) return { min: 0, median: 0, max: 0, mean: 0 }

  const prices = offers.map(o => o.price).sort((a, b) => a - b)
  const min = prices[0]
  const max = prices.at(-1)
  const mean = prices.reduce((s, p) => s + p, 0) / prices.length

  let median
  const mid = Math.floor(prices.length / 2)
  if (prices.length % 2 === 0) {
    median = (prices[mid - 1] + prices[mid]) / 2
  } else {
    median = prices[mid]
  }

  return { min, median, max, mean: Math.round(mean) }
}
