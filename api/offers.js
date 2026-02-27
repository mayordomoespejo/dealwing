/**
 * BFF endpoint: POST /api/offers
 *
 * Creates a Duffel offer request and returns the resulting flight offers.
 * The Duffel access token lives only in this server function — never exposed to the browser.
 *
 * Request body:
 *   { origin, destination, departureDate, returnDate?, passengers }
 *
 * Response:
 *   { data: [ ...duffelOffers ] }
 */

import { duffelPost } from './_duffel.js'

export default async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.DUFFEL_ACCESS_TOKEN) {
    return res.status(503).json({
      error: 'Duffel is not configured. Set DUFFEL_ACCESS_TOKEN in the server environment.',
    })
  }

  const { origin, destination, departureDate, returnDate, passengers = 1 } = req.body ?? {}

  if (!origin || !departureDate) {
    return res.status(400).json({ error: 'origin and departureDate are required' })
  }

  try {
    // Build slices — two for round-trip, one for one-way
    const slices = [{ origin, destination: destination || '', departure_date: departureDate }]
    if (returnDate && destination) {
      slices.push({ origin: destination, destination: origin, departure_date: returnDate })
    }

    // One adult per passenger count
    const passengersArr = Array.from({ length: Number(passengers) || 1 }, () => ({
      type: 'adult',
    }))

    const duffelRes = await duffelPost('/air/offer_requests', {
      data: {
        slices,
        passengers: passengersArr,
        cabin_class: 'economy',
      },
    })

    // Duffel nests offers inside the offer_request response
    const offers = duffelRes.data?.offers ?? []

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return res.status(200).json({ data: offers })
  } catch (err) {
    console.error('[offers]', err.message)
    if (err.status === 422 || err.status === 400) {
      return res.status(400).json({ error: err.message, details: err.duffelErrors })
    }
    return res.status(500).json({ error: 'Failed to fetch flight offers. Please try again.' })
  }
}
