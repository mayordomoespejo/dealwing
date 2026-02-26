import { http } from '@/lib/http.js'

/**
 * Search for flight offers via the Duffel BFF.
 * @param {object} params - validated search form values
 * @returns {object}      - { data: [...duffelOffers] }
 */
export async function searchFlightOffers(params) {
  const { origin, destination, departureDate, returnDate, adults, tripType } = params

  const response = await http.post('/api/offers', {
    origin,
    destination: destination || undefined,
    departureDate,
    returnDate: tripType === 'round-trip' ? returnDate : undefined,
    passengers: adults,
  })

  return response
}
