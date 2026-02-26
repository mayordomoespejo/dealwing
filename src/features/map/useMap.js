import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { getAirport } from '@/lib/airports.js'
import { arcCoordinates, getBounds } from '@/lib/geo.js'
import { formatPrice } from '@/lib/formatters.js'

// Free, no-API-key tile style from OpenFreeMap
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

const ORIGIN_MARKER_COLOR = '#2563eb'
const DEST_MARKER_COLOR = '#1e293b'
const ROUTE_COLOR = '#60a5fa'
const ROUTE_SELECTED_COLOR = '#2563eb'

/**
 * Manages a MapLibre GL map instance with flight routes and markers.
 *
 * @param {HTMLElement|null} container  - map container DOM element
 * @param {object[]}         flights    - domain flight offers
 * @param {string|null}      selectedId - currently selected flight id
 * @param {Function}         onSelect   - (flight) => void — called when marker is clicked
 * @param {object|null}      searchParams - current search params (for origin)
 */
export function useMap({ containerRef, flights, selectedId, onSelect, searchParams }) {
  const mapRef = useRef(null)
  const markersRef = useRef([]) // price bubble markers
  const originMarkerRef = useRef(null)
  const routesAddedRef = useRef(false)
  const isStyleLoadedRef = useRef(false)

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [15, 30],
      zoom: 2,
      minZoom: 1,
      maxZoom: 14,
      attributionControl: false,
    })

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('style.load', () => {
      isStyleLoadedRef.current = true
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      isStyleLoadedRef.current = false
      routesAddedRef.current = false
    }
  }, [containerRef])

  // Update routes + markers when flights or selection changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    function update() {
      clearMarkersAndRoutes(map, markersRef, originMarkerRef, routesAddedRef)

      if (!flights.length || !searchParams?.origin) return

      const originAirport = getAirport(searchParams.origin)
      if (!originAirport) return

      const originCoords = [originAirport.lng, originAirport.lat]

      // Origin marker (blue pulse dot)
      const originEl = createOriginMarker()
      originMarkerRef.current = new maplibregl.Marker({ element: originEl })
        .setLngLat(originCoords)
        .addTo(map)

      // Build GeoJSON for all routes
      const routeFeatures = []
      const destPoints = [originCoords]

      flights.forEach(flight => {
        const dest = getAirport(flight.destination.iata)
        if (!dest) return

        const destCoords = [dest.lng, dest.lat]
        destPoints.push(destCoords)

        const isSelected = flight.id === selectedId
        const arc = arcCoordinates(originCoords, destCoords)

        routeFeatures.push({
          type: 'Feature',
          id: flight.id,
          properties: {
            id: flight.id,
            selected: isSelected,
          },
          geometry: { type: 'LineString', coordinates: arc },
        })

        // Price bubble marker
        const markerEl = createPriceMarker(flight, isSelected, () => onSelect?.(flight))
        const marker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
          .setLngLat(destCoords)
          .addTo(map)
        markersRef.current.push(marker)
      })

      // Add route source + layers
      if (map.getSource('routes')) {
        map.getSource('routes').setData({
          type: 'FeatureCollection',
          features: routeFeatures,
        })
      } else {
        map.addSource('routes', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: routeFeatures },
        })

        // Background unselected routes
        map.addLayer({
          id: 'routes-bg',
          type: 'line',
          source: 'routes',
          filter: ['!=', ['get', 'selected'], true],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': ROUTE_COLOR,
            'line-width': 1.5,
            'line-opacity': 0.35,
            'line-dasharray': [2, 3],
          },
        })

        // Selected route (bright, solid)
        map.addLayer({
          id: 'routes-selected',
          type: 'line',
          source: 'routes',
          filter: ['==', ['get', 'selected'], true],
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': ROUTE_SELECTED_COLOR,
            'line-width': 2.5,
            'line-opacity': 0.9,
          },
        })

        routesAddedRef.current = true
      }

      // Fit bounds to show all destinations
      if (destPoints.length > 1) {
        const bounds = getBounds(destPoints)
        map.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          maxZoom: 6,
          duration: 1200,
          essential: true,
        })
      }
    }

    if (isStyleLoadedRef.current) {
      update()
    } else {
      map.once('style.load', update)
    }
  }, [flights, selectedId, onSelect, searchParams])

  // Fly to selected destination
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedId || !flights.length) return

    const flight = flights.find(f => f.id === selectedId)
    if (!flight) return

    const dest = getAirport(flight.destination.iata)
    if (!dest) return

    map.flyTo({
      center: [dest.lng, dest.lat],
      zoom: Math.max(map.getZoom(), 4),
      duration: 800,
      essential: true,
    })
  }, [selectedId, flights])

  const flyToOrigin = useCallback(iata => {
    const map = mapRef.current
    const airport = getAirport(iata)
    if (!map || !airport) return
    map.flyTo({ center: [airport.lng, airport.lat], zoom: 5, duration: 1000 })
  }, [])

  return { flyToOrigin }
}

/* ── DOM helpers ─────────────────────────────────────────────────────────── */

function clearMarkersAndRoutes(map, markersRef, originMarkerRef, routesAddedRef) {
  // Remove price markers
  markersRef.current.forEach(m => m.remove())
  markersRef.current = []

  // Remove origin marker
  originMarkerRef.current?.remove()
  originMarkerRef.current = null

  // Remove route layers/source
  if (routesAddedRef.current) {
    if (map.getLayer('routes-selected')) map.removeLayer('routes-selected')
    if (map.getLayer('routes-bg')) map.removeLayer('routes-bg')
    if (map.getSource('routes')) map.removeSource('routes')
    routesAddedRef.current = false
  }
}

function createOriginMarker() {
  const el = document.createElement('div')
  el.className = 'map-origin-marker'
  el.style.cssText = `
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${ORIGIN_MARKER_COLOR};
    border: 3px solid white;
    box-shadow: 0 0 0 3px ${ORIGIN_MARKER_COLOR}40, 0 2px 8px rgba(0,0,0,0.3);
    position: relative;
    cursor: default;
  `

  // Pulse ring animation
  const pulse = document.createElement('div')
  pulse.style.cssText = `
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px solid ${ORIGIN_MARKER_COLOR};
    opacity: 0;
    animation: mapPulse 2s ease-out infinite;
  `
  el.appendChild(pulse)

  // Inject keyframes once
  if (!document.querySelector('#map-pulse-style')) {
    const style = document.createElement('style')
    style.id = 'map-pulse-style'
    style.textContent = `
      @keyframes mapPulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  return el
}

function createPriceMarker(flight, isSelected, onClick) {
  const price = formatPrice(flight.price, flight.currency)
  const el = document.createElement('button')
  el.type = 'button'
  el.setAttribute('aria-label', `${flight.destination.city} — ${price}`)

  const baseStyle = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 5px 10px;
    border-radius: 999px;
    font-family: Inter, system-ui, sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    transition: transform 150ms ease, box-shadow 150ms ease;
    white-space: nowrap;
    outline: none;
    position: relative;
  `

  if (isSelected) {
    el.style.cssText = `${baseStyle}
      background: #2563eb;
      color: white;
      transform: scale(1.1);
      box-shadow: 0 4px 16px rgba(37,99,235,0.5), 0 2px 8px rgba(0,0,0,0.25);
      z-index: 10;
    `
  } else {
    el.style.cssText = `${baseStyle}
      background: #1e293b;
      color: white;
    `

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.08)'
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.35)'
    })
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)'
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)'
    })
  }

  el.innerHTML = `
    <span style="font-size:10px;opacity:0.8">${flight.destination.iata}</span>
    <span>${price}</span>
  `

  el.addEventListener('click', e => {
    e.stopPropagation()
    onClick()
  })

  return el
}
