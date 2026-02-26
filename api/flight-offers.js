/**
 * BFF endpoint: /api/flight-offers
 * Proxies to Amadeus GET /v2/shopping/flight-offers
 *
 * Query params (all forwarded to Amadeus):
 *   originLocationCode, destinationLocationCode, departureDate,
 *   returnDate, adults, currencyCode, max
 */

import { amadeusGet } from './_amadeus.js'
import { mockFlightOffersResponse } from './_mock.js'

const MOCK = process.env.AMADEUS_MOCK_MODE === 'true' || !process.env.AMADEUS_CLIENT_ID

export default async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    originLocationCode,
    destinationLocationCode,
    departureDate,
    returnDate,
    adults = '1',
    currencyCode = 'EUR',
    max = '20',
  } = req.query

  if (!originLocationCode || !departureDate) {
    return res.status(400).json({ error: 'originLocationCode and departureDate are required' })
  }

  try {
    let data

    if (MOCK) {
      // Return mock data without hitting Amadeus
      data = mockFlightOffersResponse({ originLocationCode, destinationLocationCode })
    } else {
      data = await amadeusGet('/v2/shopping/flight-offers', {
        originLocationCode,
        destinationLocationCode,
        departureDate,
        returnDate,
        adults,
        currencyCode,
        max,
        nonStop: 'false',
      })
    }

    // 5-minute cache
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json(data)
  } catch (err) {
    console.error('[flight-offers]', err.message)
    if (err.status === 400) {
      return res.status(400).json({ error: err.message, details: err.amadeusErrors })
    }
    return res.status(500).json({ error: 'Failed to fetch flight offers. Please try again.' })
  }
}
