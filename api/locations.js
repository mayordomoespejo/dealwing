/**
 * BFF endpoint: GET /api/locations
 * Returns airport search results from a local static dataset.
 * Duffel does not provide a free airport-search endpoint, so we serve
 * our own curated list. This keeps autocomplete fully offline-first.
 *
 * Query params:
 *   q - search text (airport name, city, or IATA code)
 */

import { mockLocationsResponse } from './_mock.js'

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
    return res.status(200).json({ data: [] })
  }

  const data = mockLocationsResponse(q)
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
  return res.status(200).json(data)
}
