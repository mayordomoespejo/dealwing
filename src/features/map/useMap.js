import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { getAirport } from '@/lib/airports.js'
import { arcCoordinates, getBounds } from '@/lib/geo.js'
import { formatPrice } from '@/lib/formatters.js'

// Free, no-API-key tile style from OpenFreeMap (OpenMapTiles schema: name_en, name_es, name)
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

// Layer IDs that show text labels (symbol layers with text-field). Liberty style uses
// name:latin/name:nonlatin for scripts and coalesce(name_en, name) for default language.
const LABEL_LAYER_IDS_LINE = [
  'waterway_line_label',
  'water_name_line_label',
  'highway-name-path',
  'highway-name-minor',
  'highway-name-major',
]
const LABEL_LAYER_IDS_POINT = [
  'water_name_point_label',
  'poi_r20',
  'poi_r7',
  'poi_r1',
  'poi_transit',
  'airport',
  'label_other',
  'label_village',
  'label_town',
  'label_state',
  'label_city',
  'label_city_capital',
  'label_country_3',
  'label_country_2',
  'label_country_1',
]

// Expressions: prefer name_es when language is 'es', else name_en. OpenMapTiles has name_es/name_en/name.
const separatorLine = ' '
const separatorPoint = '\n'

function textFieldExpressionEn(separator) {
  return [
    'case',
    ['has', 'name:nonlatin'],
    ['concat', ['get', 'name:latin'], separator, ['get', 'name:nonlatin']],
    ['coalesce', ['get', 'name_en'], ['get', 'name']],
  ]
}

function textFieldExpressionEs(separator) {
  return [
    'case',
    ['has', 'name:nonlatin'],
    ['concat', ['get', 'name:latin'], separator, ['get', 'name:nonlatin']],
    ['coalesce', ['get', 'name_es'], ['get', 'name_en'], ['get', 'name']],
  ]
}

// Brand colors (match CSS --color-brand / --color-brand-400)
const ORIGIN_MARKER_COLOR = '#ea580c' // --color-brand (brand-600)
const DEST_MARKER_COLOR = '#1e293b' // neutral dark
const ROUTE_COLOR = '#ea580c' // brand: routes use brand color
const ROUTE_SELECTED_COLOR = '#ea580c' // brand: selected route same color, higher opacity/width

/**
 * Manages a MapLibre GL map instance with flight routes and markers.
 *
 * @param {HTMLElement|null} container  - map container DOM element
 * @param {object[]}         flights    - domain flight offers
 * @param {string|null}      selectedId - currently selected flight id
 * @param {Function}         onSelect   - (flight) => void — called when marker is clicked
 * @param {object|null}      searchParams - current search params (for origin)
 * @param {string}           [language]   - i18n language code ('es', 'en') for map labels
 */
export function useMap({
  containerRef,
  flights,
  selectedId,
  onSelect,
  searchParams,
  language = 'en',
}) {
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const originMarkerRef = useRef(null)
  const routesAddedRef = useRef(false)
  const destLayersAddedRef = useRef(false)
  const isStyleLoadedRef = useRef(false)
  const flightsRef = useRef(flights)
  flightsRef.current = flights

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
      destLayersAddedRef.current = false
    }
  }, [containerRef])

  // Apply map label language (OpenMapTiles: name_es, name_en, name) when style is ready and when language changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    function applyMapLanguage() {
      if (!map.getStyle() || !map.isStyleLoaded()) return
      const useSpanish = language === 'es'
      const exprLine = useSpanish
        ? textFieldExpressionEs(separatorLine)
        : textFieldExpressionEn(separatorLine)
      const exprPoint = useSpanish
        ? textFieldExpressionEs(separatorPoint)
        : textFieldExpressionEn(separatorPoint)

      LABEL_LAYER_IDS_LINE.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'text-field', exprLine)
        }
      })
      LABEL_LAYER_IDS_POINT.forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'text-field', exprPoint)
        }
      })
    }

    if (isStyleLoadedRef.current) {
      applyMapLanguage()
    } else {
      map.once('style.load', applyMapLanguage)
    }
  }, [language])

  // Update routes + markers when flights or selection changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    function update() {
      clearMarkersAndRoutes(map, markersRef, originMarkerRef, routesAddedRef, destLayersAddedRef)

      if (!flights.length || !searchParams?.origin) return

      const originAirport = getAirport(searchParams.origin)
      if (!originAirport) return

      const originCoords = [originAirport.lng, originAirport.lat]

      // Origin marker (brand pulse dot) — DOM marker is fine for a single point
      const originEl = createOriginMarker()
      originMarkerRef.current = new maplibregl.Marker({ element: originEl })
        .setLngLat({ lng: originAirport.lng, lat: originAirport.lat })
        .addTo(map)

      const routeFeatures = []
      const destPointFeatures = []
      const destPoints = [originCoords]

      flights.forEach(flight => {
        const dest = getAirport(flight.destination?.iata)
        if (!dest) return

        const destCoords = [dest.lng, dest.lat]
        destPoints.push(destCoords)
        const isSelected = flight.id === selectedId
        const priceFormatted = formatPrice(flight.price, flight.currency)
        const label = `${flight.destination.iata}\n${priceFormatted}`

        routeFeatures.push({
          type: 'Feature',
          id: flight.id,
          properties: { id: flight.id, selected: isSelected },
          geometry: { type: 'LineString', coordinates: arcCoordinates(originCoords, destCoords) },
        })

        // Same coordinates as the route endpoint — rendered as map layers so they stay in sync
        destPointFeatures.push({
          type: 'Feature',
          id: flight.id,
          properties: {
            id: flight.id,
            iata: flight.destination.iata,
            priceFormatted,
            label,
            selected: isSelected,
          },
          geometry: { type: 'Point', coordinates: destCoords },
        })
      })

      // Routes source + layers
      if (map.getSource('routes')) {
        map.getSource('routes').setData({ type: 'FeatureCollection', features: routeFeatures })
      } else {
        map.addSource('routes', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: routeFeatures },
        })
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

      // Destination points: same GeoJSON coords as route ends — circle + symbol layers (no DOM markers)
      if (map.getSource('destination-points')) {
        map.getSource('destination-points').setData({
          type: 'FeatureCollection',
          features: destPointFeatures,
        })
      } else {
        map.addSource('destination-points', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: destPointFeatures },
        })
        map.addLayer({
          id: 'destinations-circle',
          type: 'circle',
          source: 'destination-points',
          paint: {
            'circle-radius': 14,
            'circle-color': ['case', ['get', 'selected'], ORIGIN_MARKER_COLOR, DEST_MARKER_COLOR],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          },
        })
        map.addLayer({
          id: 'destinations-label',
          type: 'symbol',
          source: 'destination-points',
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 12,
            'text-offset': [0, -1.8],
            'text-anchor': 'top',
            'text-max-width': 8,
            'text-line-height': 1.2,
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': 'rgba(0,0,0,0.5)',
            'text-halo-width': 1,
          },
        })
        destLayersAddedRef.current = true

        map.on('click', 'destinations-circle', e => {
          const f = e.features?.[0]
          if (!f) return
          const flight = flightsRef.current.find(x => x.id === f.properties.id)
          if (flight) onSelect?.(flight)
        })
        map.on('mouseenter', 'destinations-circle', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'destinations-circle', () => {
          map.getCanvas().style.cursor = ''
        })
      }

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

    // Run update when the map is ready and has laid out (so marker positions are correct)
    function scheduleUpdate() {
      map.resize() // use current container dimensions before positioning markers
      if (map.isStyleLoaded()) {
        map.once('idle', update)
      } else {
        map.once('style.load', () => map.once('idle', update))
      }
    }

    if (isStyleLoadedRef.current) {
      scheduleUpdate()
    } else {
      map.once('style.load', () => {
        isStyleLoadedRef.current = true
        scheduleUpdate()
      })
    }
  }, [flights, selectedId, onSelect, searchParams])

  const flyToOrigin = useCallback(iata => {
    const map = mapRef.current
    const airport = getAirport(iata)
    if (!map || !airport) return
    map.flyTo({ center: [airport.lng, airport.lat], zoom: 5, duration: 1000 })
  }, [])

  return { flyToOrigin }
}

/* ── DOM helpers ─────────────────────────────────────────────────────────── */

function clearMarkersAndRoutes(
  map,
  markersRef,
  originMarkerRef,
  routesAddedRef,
  destLayersAddedRef
) {
  markersRef.current.forEach(m => m.remove())
  markersRef.current = []

  originMarkerRef.current?.remove()
  originMarkerRef.current = null

  if (destLayersAddedRef.current) {
    map.off('click', 'destinations-circle')
    map.off('mouseenter', 'destinations-circle')
    map.off('mouseleave', 'destinations-circle')
    if (map.getLayer('destinations-label')) map.removeLayer('destinations-label')
    if (map.getLayer('destinations-circle')) map.removeLayer('destinations-circle')
    if (map.getSource('destination-points')) map.removeSource('destination-points')
    destLayersAddedRef.current = false
  }

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
