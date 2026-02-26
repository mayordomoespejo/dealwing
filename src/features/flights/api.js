import { http } from '@/lib/http.js'
import { mockFlightOffersResponse } from '../../../api/_mock.js'

const MOCK = import.meta.env.VITE_MOCK_API === 'true'

/**
 * Search for flight offers.
 * @param {object} params - validated search form values
 * @returns {object}      - raw Amadeus-format response
 */
export async function searchFlightOffers(params) {
  const { origin, destination, departureDate, returnDate, adults, tripType, currency } = params

  if (MOCK) {
    // Simulate a slight network delay for realism
    await new Promise(r => setTimeout(r, 600 + Math.random() * 400))
    return mockFlightOffersResponse({
      originLocationCode: origin,
      destinationLocationCode: destination,
    })
  }

  return http.get('/api/flight-offers', {
    originLocationCode: origin,
    destinationLocationCode: destination || undefined,
    departureDate,
    returnDate: tripType === 'round-trip' ? returnDate : undefined,
    adults: String(adults),
    currencyCode: currency,
    max: '20',
  })
}
