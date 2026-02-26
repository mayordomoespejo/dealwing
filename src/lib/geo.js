/**
 * Haversine distance between two lat/lng points (in km).
 */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function toRad(deg) {
  return (deg * Math.PI) / 180
}

/**
 * Generate a smooth arc between two [lng, lat] points for map drawing.
 * Uses a quadratic Bezier with the control point elevated above the midpoint.
 * @param {[number,number]} from - [lng, lat]
 * @param {[number,number]} to   - [lng, lat]
 * @param {number} steps         - number of interpolation points
 * @returns {[number,number][]}  - array of [lng, lat] coordinates
 */
export function arcCoordinates(from, to, steps = 80) {
  const [x0, y0] = from
  const [x1, y1] = to

  // Midpoint
  const mx = (x0 + x1) / 2
  const my = (y0 + y1) / 2

  // Elevate the control point to create the arc curvature
  const dist = Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2)
  const elevation = Math.min(dist * 0.25, 20) // cap at 20° lat

  // Perpendicular offset (always curve northward for Southern → Northern routes)
  const cx = mx
  const cy = my + elevation

  const points = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const lng = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1
    const lat = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1
    points.push([lng, lat])
  }
  return points
}

/**
 * Compute map bounds that fit all given [lng, lat] points.
 * Returns [[minLng, minLat], [maxLng, maxLat]]
 */
export function getBounds(points) {
  let minLng = Infinity,
    minLat = Infinity,
    maxLng = -Infinity,
    maxLat = -Infinity

  for (const [lng, lat] of points) {
    if (lng < minLng) minLng = lng
    if (lat < minLat) minLat = lat
    if (lng > maxLng) maxLng = lng
    if (lat > maxLat) maxLat = lat
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}
