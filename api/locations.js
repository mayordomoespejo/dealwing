/**
 * BFF endpoint: GET /api/locations
 * Returns airport search results from AeroDataBox (RapidAPI).
 * Requires RAPIDAPI_KEY in environment variables.
 *
 * Query params:
 *   q - search text (airport name, city, or IATA code); min 3 characters (AeroDataBox requirement).
 */

import { searchAirportsByTerm } from './_aerodatabox.js'

const LIMIT = 10
const MIN_QUERY_LENGTH = 3

/**
 * Map AeroDataBox response to the shape expected by AirportAutocomplete.
 * API returns { searchBy, count, items } — each item: iata, name, municipalityName, countryCode, etc.
 * @see https://doc.aerodatabox.com/rapidapi.html#/operations/SearchAirportByTerm
 */
function mapAerodataboxToLocations(items) {
  if (!Array.isArray(items)) return []
  return items
    .filter(item => item?.iata)
    .map(item => ({
      iataCode: item.iata,
      name: item.name ?? item.iata,
      cityName: item.municipalityName ?? item.name ?? '',
      countryCode: item.countryCode ?? '',
    }))
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q } = req.query
  const query = q ? String(q).trim() : ''
  if (query.length < MIN_QUERY_LENGTH) {
    return res.status(200).json({ data: [] })
  }

  try {
    const raw = await searchAirportsByTerm(query, LIMIT)
    const items = raw?.items ?? (Array.isArray(raw) ? raw : [])
    const data = mapAerodataboxToLocations(items)
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json({ data })
  } catch (err) {
    console.error('[locations]', err.message)
    const status = err.message?.includes('RAPIDAPI_KEY') ? 503 : 502
    return res.status(status).json({
      error:
        status === 503
          ? 'Airport search not configured. Set RAPIDAPI_KEY in .env.local (or Vercel env).'
          : 'Airport search temporarily unavailable',
      details: err.message,
    })
  }
}
