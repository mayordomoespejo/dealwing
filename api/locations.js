/**
 * BFF endpoint: /api/locations
 * Proxies to Amadeus GET /v1/reference-data/locations
 *
 * Query params:
 *   q - search text (airport name, city, IATA code)
 */

import { amadeusGet } from './_amadeus.js'
import { mockLocationsResponse } from './_mock.js'

const MOCK = process.env.AMADEUS_MOCK_MODE === 'true' || !process.env.AMADEUS_CLIENT_ID

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q } = req.query
  if (!q || q.length < 1) {
    return res.status(200).json({ data: [], meta: { count: 0 } })
  }

  try {
    let data

    if (MOCK) {
      data = mockLocationsResponse(q)
    } else {
      data = await amadeusGet('/v1/reference-data/locations', {
        keyword: q,
        subType: 'AIRPORT,CITY',
        'page[limit]': '10',
        sort: 'analytics.travelers.score',
        view: 'LIGHT',
      })
    }

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json(data)
  } catch (err) {
    console.error('[locations]', err.message)
    return res.status(500).json({ error: 'Failed to search locations.' })
  }
}
