import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import { getAirport } from '@/lib/airports.js'
import { arcCoordinates, getBounds } from '@/lib/geo.js'

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty'

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

const BRAND = '#ea580c'
const DARK = '#1e293b'
const ROUTE_COLOR = '#ea580c'
const ROUTE_SELECTED_COLOR = '#ea580c'

/**
 * Manages a MapLibre GL map instance with flight routes and markers.
 *
 * @param {object}   containerRef  - ref to the map container DOM element
 * @param {object[]} flights       - domain flight offers
 * @param {string}   selectedId    - currently selected flight id
 * @param {object}   searchParams  - current search params (for origin airport)
 * @param {string}   [language]    - i18n language code ('es' | 'en') for map labels
 */
export function useMap({ containerRef, flights, selectedId, searchParams, language = 'en' }) {
  const mapRef = useRef(null)
  const destMarkersRef = useRef([])
  const originMarkerRef = useRef(null)
  const routesAddedRef = useRef(false)
  const isStyleLoadedRef = useRef(false)
  const prevFlightIdsRef = useRef('')

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

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')

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
        if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'text-field', exprLine)
      })
      LABEL_LAYER_IDS_POINT.forEach(layerId => {
        if (map.getLayer(layerId)) map.setLayoutProperty(layerId, 'text-field', exprPoint)
      })
    }

    if (!isStyleLoadedRef.current) {
      map.once('style.load', applyMapLanguage)
      return
    }
    applyMapLanguage()
  }, [language])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    function update() {
      clearMarkersAndRoutes(map, destMarkersRef, originMarkerRef, routesAddedRef)

      if (!flights.length || !searchParams?.origin) return

      const originAirport = getAirport(searchParams.origin) ?? flights[0]?.origin
      if (!originAirport?.lat || !originAirport?.lng) return

      const originCoords = [originAirport.lng, originAirport.lat]

      const originEl = createOriginMarker()
      originMarkerRef.current = new maplibregl.Marker({ element: originEl })
        .setLngLat([originAirport.lng, originAirport.lat])
        .addTo(map)

      const uniqueDests = [
        ...new Map(
          flights
            .filter(f => f.destination?.lat && f.destination?.lng)
            .map(f => [f.destination.iata, f.destination])
        ).values(),
      ]

      if (uniqueDests.length === 0) return

      const allPoints = [originCoords, ...uniqueDests.map(d => [d.lng, d.lat])]

      const routeKeyToFeature = new Map()
      flights
        .filter(f => f.destination?.lat && f.destination?.lng)
        .forEach(flight => {
          const destCoords = [flight.destination.lng, flight.destination.lat]
          const key = `${originCoords[0]},${originCoords[1]}-${destCoords[0]},${destCoords[1]}`
          const isSelected = flight.id === selectedId
          if (!routeKeyToFeature.has(key)) {
            routeKeyToFeature.set(key, {
              type: 'Feature',
              id: key,
              properties: { id: key, selected: isSelected },
              geometry: {
                type: 'LineString',
                coordinates: arcCoordinates(originCoords, destCoords),
              },
            })
            return
          }
          const f = routeKeyToFeature.get(key)
          if (isSelected) f.properties.selected = true
        })
      const routeFeatures = [...routeKeyToFeature.values()]

      uniqueDests.forEach(dest => {
        const destEl = createDestMarker(dest.iata)
        const marker = new maplibregl.Marker({ element: destEl, anchor: 'bottom', offset: [0, 6] })
          .setLngLat([dest.lng, dest.lat])
          .addTo(map)
        destMarkersRef.current.push(marker)
      })

      const routesSource = map.getSource('routes')
      if (routesSource) {
        routesSource.setData({ type: 'FeatureCollection', features: routeFeatures })
      }
      if (!routesSource) {
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
            'line-opacity': 0.85,
            'line-dasharray': [2, 3],
          },
        })
        routesAddedRef.current = true
      }

      const flightIds = flights.map(f => f.id).join(',')
      const flightsChanged = prevFlightIdsRef.current !== flightIds
      prevFlightIdsRef.current = flightIds

      if (allPoints.length > 1 && flightsChanged) {
        const bounds = getBounds(allPoints)
        map.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 80, right: 80 },
          maxZoom: 6,
          duration: 1200,
          essential: true,
        })
      }
    }

    function scheduleUpdate() {
      map.resize()
      if (!map.isStyleLoaded()) {
        map.once('style.load', () => map.once('idle', update))
        return
      }
      map.once('idle', update)
    }

    if (!isStyleLoadedRef.current) {
      map.once('style.load', () => {
        isStyleLoadedRef.current = true
        scheduleUpdate()
      })
      return
    }
    scheduleUpdate()
  }, [flights, selectedId, searchParams])

  const flyToOrigin = useCallback(iata => {
    const map = mapRef.current
    const airport = getAirport(iata)
    if (!map || !airport) return
    map.flyTo({ center: [airport.lng, airport.lat], zoom: 5, duration: 1000 })
  }, [])

  const flyToDest = useCallback(dest => {
    const map = mapRef.current
    if (!map || !dest?.lat || !dest?.lng) return
    map.easeTo({ center: [dest.lng, dest.lat], duration: 600 })
  }, [])

  return { flyToOrigin, flyToDest }
}

function clearMarkersAndRoutes(map, destMarkersRef, originMarkerRef, routesAddedRef) {
  destMarkersRef.current.forEach(m => m.remove())
  destMarkersRef.current = []
  originMarkerRef.current?.remove()
  originMarkerRef.current = null

  if (routesAddedRef.current) {
    if (map.getLayer('routes-selected')) map.removeLayer('routes-selected')
    if (map.getLayer('routes-bg')) map.removeLayer('routes-bg')
    if (map.getSource('routes')) map.removeSource('routes')
    routesAddedRef.current = false
  }
}

/**
 * Injects shared marker CSS once into <head>.
 * Covers both destination badge styles and the origin pulse keyframes.
 */
function injectMarkerStyles() {
  if (document.querySelector('#map-marker-style')) return
  const style = document.createElement('style')
  style.id = 'map-marker-style'
  style.textContent = `
    .map-dest-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: default;
      user-select: none;
    }
    .map-dest-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 4px 10px 5px;
      border-radius: 8px;
      background: ${DARK};
      color: #fff;
      border: 1.5px solid rgba(255,255,255,0.1);
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      white-space: nowrap;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      line-height: 1.1;
    }
    .map-dest-iata {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.4px;
      text-transform: uppercase;
    }
    .map-dest-stem {
      width: 2px;
      height: 6px;
    }
    .map-dest-dot {
      width: 11px;
      height: 11px;
      border-radius: 50%;
      border: 2.5px solid #fff;
      margin-top: -1px;
    }
    @keyframes mapPulse {
      0%   { transform: scale(1);   opacity: 0.6; }
      100% { transform: scale(2.5); opacity: 0;   }
    }
  `
  document.head.appendChild(style)
}

/**
 * Creates a pill-badge destination marker element (IATA only, not clickable).
 *   ┌──────────────┐
 *   │     RMU      │  ← rounded badge
 *   └──────────────┘
 *         │           ← stem
 *         ●           ← dot (anchor point = coordinate)
 */
function createDestMarker(iata) {
  injectMarkerStyles()

  const el = document.createElement('div')
  el.className = 'map-dest-pin'
  el.style.zIndex = '1'

  const badge = document.createElement('div')
  badge.className = 'map-dest-badge'

  const iataEl = document.createElement('span')
  iataEl.className = 'map-dest-iata'
  iataEl.textContent = iata

  badge.append(iataEl)

  const stem = document.createElement('div')
  stem.className = 'map-dest-stem'
  stem.style.background = DARK

  const dot = document.createElement('div')
  dot.className = 'map-dest-dot'
  dot.style.background = DARK

  el.append(badge, stem, dot)
  return el
}

/**
 * Creates the origin pulse-dot marker element (brand orange with animated ring).
 */
function createOriginMarker() {
  injectMarkerStyles()

  const el = document.createElement('div')
  el.className = 'map-origin-marker'
  el.style.cssText = `
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${BRAND};
    border: 3px solid white;
    box-shadow: 0 0 0 3px ${BRAND}40, 0 2px 8px rgba(0,0,0,0.3);
    position: relative;
    cursor: default;
  `

  const pulse = document.createElement('div')
  pulse.style.cssText = `
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2px solid ${BRAND};
    opacity: 0;
    animation: mapPulse 2s ease-out infinite;
  `
  el.appendChild(pulse)
  return el
}
