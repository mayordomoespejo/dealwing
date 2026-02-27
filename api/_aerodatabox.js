/**
 * AeroDataBox API (RapidAPI) — airport search.
 * Uses RAPIDAPI_KEY from environment variables. Never expose it to the frontend.
 *
 * Endpoint: GET /airports/search/term?q=...&limit=...
 * Docs: https://rapidapi.com/aedbx-aedbx/api/aerodatabox
 */

const AERODATABOX_BASE = 'https://aerodatabox.p.rapidapi.com'

/**
 * Search airports by term (name, city, or IATA code).
 * @param {string} query - search term
 * @param {number} [limit=10] - max results
 * @returns {Promise<Array>} - raw API response (array of airport objects)
 */
export async function searchAirportsByTerm(query, limit = 10) {
  const key = process.env.RAPIDAPI_KEY
  if (!key) {
    throw new Error('RAPIDAPI_KEY is not set')
  }

  const url = new URL(`${AERODATABOX_BASE}/airports/search/term`)
  url.searchParams.set('q', query.trim())
  url.searchParams.set('limit', String(limit))

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 8000)

  let res
  try {
    res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'aerodatabox.p.rapidapi.com',
        'x-rapidapi-key': key,
      },
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`AeroDataBox API error ${res.status}: ${text.slice(0, 200)}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    const text = await res.text()
    throw new Error(`AeroDataBox returned non-JSON (${contentType}): ${text.slice(0, 100)}`)
  }

  return res.json()
}
