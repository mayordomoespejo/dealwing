import { getAirport } from '@/lib/airports.js'
import { haversineKm } from '@/lib/geo.js'

/**
 * Estimate CO₂ emissions (in kg) per passenger for a flight.
 *
 * ⚠️  DISCLAIMER: This is an approximate estimate using industry average
 * emission factors. Actual emissions vary by aircraft type, load factor,
 * seating class, and specific routing. Use as a rough comparison only.
 *
 * Methodology (simplified ICAO method):
 *   1. Calculate great-circle distance between airports.
 *   2. Apply economy emission factor based on haul length:
 *      Short-haul (< 1500 km): ~0.255 kg CO₂/km/pax
 *      Long-haul  (≥ 1500 km): ~0.195 kg CO₂/km/pax
 *   3. Apply Radiative Forcing Index (RFI = 1.9) to account for
 *      high-altitude warming effects.
 *   4. Add airport/infrastructure overhead (~11%).
 *
 * Sources: ICAO Carbon Emissions Calculator, atmosfair, myclimate.
 */

const SHORT_HAUL_FACTOR = 0.255 // kg CO₂/km per passenger (economy, <1500 km)
const LONG_HAUL_FACTOR = 0.195 // kg CO₂/km per passenger (economy, ≥1500 km)
const RFI = 1.9 // Radiative Forcing Index
const OVERHEAD = 1.11 // Infrastructure/indirect emissions overhead

/**
 * @param {string}   originIata
 * @param {string}   destIata
 * @param {object[]} segments      - outbound segments (for multi-stop routing)
 * @param {number}   durationMin   - used as fallback if coordinates not found
 * @returns {number}               - CO₂ in kg per passenger (rounded integer)
 */
export function estimateCO2(originIata, destIata, segments = [], durationMin = 0) {
  try {
    let totalKm = 0

    if (segments.length > 1) {
      // Multi-segment: sum each leg's distance
      for (let i = 0; i < segments.length; i++) {
        const from = getAirport(segments[i].departure.iataCode)
        const to = getAirport(segments[i].arrival.iataCode)
        if (from && to) {
          totalKm += haversineKm(from.lat, from.lng, to.lat, to.lng)
        }
      }
    } else {
      const origin = getAirport(originIata)
      const dest = getAirport(destIata)
      if (origin && dest) {
        totalKm = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng)
      }
    }

    if (totalKm === 0) {
      // Fallback: estimate distance from duration (~800 km/h cruise speed)
      totalKm = (durationMin / 60) * 800
    }

    const factor = totalKm < 1500 ? SHORT_HAUL_FACTOR : LONG_HAUL_FACTOR
    const co2 = totalKm * factor * RFI * OVERHEAD

    return Math.round(co2)
  } catch {
    return 0
  }
}
