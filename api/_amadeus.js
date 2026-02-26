/**
 * Amadeus Self-Service API helper.
 * Handles OAuth2 client_credentials token with in-memory caching.
 *
 * Docs: https://developers.amadeus.com/self-service
 */

const BASE_URL =
  process.env.AMADEUS_ENV === 'production'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com'

let _token = null
let _tokenExpiry = 0

/**
 * Get a valid Amadeus access token (cached until near-expiry).
 */
export async function getAmadeusToken() {
  if (_token && Date.now() < _tokenExpiry) {
    return _token
  }

  const res = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID,
      client_secret: process.env.AMADEUS_CLIENT_SECRET,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Amadeus auth failed: ${err}`)
  }

  const data = await res.json()
  _token = data.access_token
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // 60s buffer
  return _token
}

/**
 * Make an authenticated request to the Amadeus API.
 * @param {string} path        - e.g. '/v2/shopping/flight-offers'
 * @param {object} params      - query params
 */
export async function amadeusGet(path, params = {}) {
  const token = await getAmadeusToken()

  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null)
  )

  const res = await fetch(`${BASE_URL}${path}?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.errors?.[0]?.detail ?? `Amadeus API error ${res.status}`
    const error = new Error(msg)
    error.status = res.status
    error.amadeusErrors = err?.errors
    throw error
  }

  return res.json()
}
