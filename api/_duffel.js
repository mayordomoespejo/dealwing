/**
 * Duffel API helper.
 * Docs: https://duffel.com/docs/api
 *
 * Uses DUFFEL_ACCESS_TOKEN from environment variables.
 * Never expose this token to the frontend.
 */

const DUFFEL_BASE = 'https://api.duffel.com'

/**
 * Make an authenticated POST request to the Duffel API.
 * @param {string} path - e.g. '/air/offer_requests'
 * @param {object} body - request body (will be wrapped in { data: body })
 */
export async function duffelPost(path, body) {
  const res = await fetch(`${DUFFEL_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Duffel-Version': 'v2',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.errors?.[0]?.message ?? `Duffel API error ${res.status}`
    const error = new Error(msg)
    error.status = res.status
    error.duffelErrors = err?.errors
    throw error
  }

  return res.json()
}
