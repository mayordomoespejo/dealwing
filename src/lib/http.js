/**
 * Lightweight fetch wrapper with error handling and query-string support.
 * Usage:
 *   http.get('/api/locations', { q: 'London' })
 *   http.post('/api/flight-offers', body)
 */

class HttpError extends Error {
  constructor(status, message, data) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.data = data
  }
}

async function request(url, { params, ...options } = {}) {
  let fullUrl = url
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    )
    fullUrl = `${url}?${qs.toString()}`
  }

  const res = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  let data
  const contentType = res.headers.get('Content-Type') ?? ''
  if (contentType.includes('application/json')) {
    data = await res.json()
  } else {
    data = await res.text()
  }

  if (!res.ok) {
    const message = data?.errors?.[0]?.detail ?? data?.message ?? `HTTP ${res.status}`
    throw new HttpError(res.status, message, data)
  }

  return data
}

export const http = {
  get: (url, params, options) => request(url, { method: 'GET', params, ...options }),
  post: (url, body, options) =>
    request(url, { method: 'POST', body: JSON.stringify(body), ...options }),
}

export { HttpError }
