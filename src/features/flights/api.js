import { http } from '@/lib/http.js'
import { mockOffersResponse } from '../../../api/_mock.js'

const MOCK = import.meta.env.VITE_MOCK_API === 'true'

/**
 * Search for flight offers via the Duffel BFF.
 * @param {object} params - validated search form values
 * @returns {object}      - { data: [...duffelOffers] }
 */
export async function searchFlightOffers(params) {
  const { origin, destination, departureDate, returnDate, adults, tripType } = params

  if (MOCK) {
    // Simulate network delay for realism
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
    return mockOffersResponse({ origin, destination })
  }

  return http.post('/api/offers', {
    origin,
    destination: destination || undefined,
    departureDate,
    returnDate: tripType === 'round-trip' ? returnDate : undefined,
    passengers: adults,
  })
}
