import { getAirport } from '@/lib/airports.js'
import { parseDurationMinutes } from '@/lib/formatters.js'
import { computeDealScore } from './dealScore.js'
import { estimateCO2 } from './co2.js'

/**
 * Builds a normalized airport object from static data or Duffel fallback fields.
 *
 * @param {string} iataCode - airport IATA code
 * @param {object | undefined} airportData - Duffel location payload
 * @returns {object}
 */
function resolveAirport(iataCode, airportData) {
  const airport = getAirport(iataCode)
  if (airport) return airport

  return {
    iata: iataCode,
    name: airportData?.name ?? iataCode,
    city: airportData?.city_name ?? iataCode,
    country: airportData?.iata_country_code ?? '',
    lat: airportData?.latitude,
    lng: airportData?.longitude,
  }
}

/**
 * Collects distinct marketing carriers from the itinerary segments.
 *
 * @param {object[]} segments - normalized flight segments
 * @returns {{ airlines: string[], airlineNames: string[], airlineLogoUrls: Array<string | null> }}
 */
function collectAirlines(segments) {
  const seenCodes = new Set()
  const airlines = []
  const airlineNames = []
  const airlineLogoUrls = []

  for (const segment of segments) {
    if (seenCodes.has(segment.carrierCode)) continue
    seenCodes.add(segment.carrierCode)
    airlines.push(segment.carrierCode)
    airlineNames.push(segment.carrierName)
    airlineLogoUrls.push(segment.carrierLogoUrl)
  }

  return { airlines, airlineNames, airlineLogoUrls }
}

/**
 * Map a Duffel flight offer to our UI domain model.
 *
 * @param {object} rawOffer - raw Duffel offer object from `/air/offer_requests`
 * @returns {{
 *   id: string,
 *   origin: object, destination: object,
 *   price: number, priceBase: number, currency: string,
 *   outbound: { duration: string, durationMin: number, stops: number, segments: object[] },
 *   inbound: { duration: string, durationMin: number, stops: number, segments: object[] } | null,
 *   totalDurationMin: number,
 *   stops: number,
 *   airlines: string[], airlineNames: string[], airlineLogoUrls: string[],
 *   isRoundTrip: boolean,
 *   dealScore: number,
 *   co2Kg: number,
 *   _raw: object
 * }}
 */
export function mapFlightOffer(rawOffer) {
  const outboundSlice = rawOffer.slices[0]
  const inboundSlice = rawOffer.slices[1] ?? null

  const duffelOrigin = outboundSlice.origin
  const duffelDest = outboundSlice.destination

  const outboundSegments = outboundSlice.segments.map(mapSegment)
  const inboundSegments = inboundSlice ? inboundSlice.segments.map(mapSegment) : null

  const originIata = outboundSegments[0].departure.iataCode
  const destIata = outboundSegments.at(-1).arrival.iataCode

  const outDurationMin = parseDurationMinutes(outboundSlice.duration)
  const inDurationMin = inboundSlice ? parseDurationMinutes(inboundSlice.duration) : 0

  const outStops = outboundSegments.length - 1
  const inStops = inboundSegments ? inboundSegments.length - 1 : 0

  const allSegments = [...outboundSegments, ...(inboundSegments ?? [])]
  const { airlines, airlineNames, airlineLogoUrls } = collectAirlines(allSegments)

  const passengerCount = rawOffer.passengers?.length || 1
  const totalPrice = parseFloat(rawOffer.total_amount)
  const pricePerPax = totalPrice / passengerCount
  const currency = rawOffer.total_currency

  const co2Kg = rawOffer.total_emissions_kg
    ? Math.round(parseFloat(rawOffer.total_emissions_kg) / passengerCount)
    : estimateCO2(originIata, destIata, outboundSegments, outDurationMin)

  return {
    id: rawOffer.id,
    origin: resolveAirport(originIata, duffelOrigin),
    destination: resolveAirport(destIata, duffelDest),
    price: pricePerPax,
    priceBase: parseFloat(rawOffer.base_amount ?? rawOffer.total_amount) / passengerCount,
    currency,
    outbound: {
      duration: outboundSlice.duration,
      durationMin: outDurationMin,
      stops: outStops,
      segments: outboundSegments,
    },
    inbound: inboundSlice
      ? {
          duration: inboundSlice.duration,
          durationMin: inDurationMin,
          stops: inStops,
          segments: inboundSegments,
        }
      : null,
    totalDurationMin: outDurationMin + inDurationMin,
    stops: outStops,
    airlines,
    airlineNames,
    airlineLogoUrls,
    isRoundTrip: !!inboundSlice,
    dealScore: 0,
    co2Kg,
    _raw: rawOffer,
  }
}

/**
 * Map a single Duffel segment to our domain segment model.
 * Duffel uses snake_case field names; this normalises them to camelCase.
 * `marketing_carrier` may include a `logo_symbol_url` (Duffel hosted asset).
 *
 * @param {object} seg - raw Duffel segment object
 * @returns {{
 *   id: string,
 *   departure: { iataCode: string, terminal: string|null, at: string },
 *   arrival:   { iataCode: string, terminal: string|null, at: string },
 *   carrierCode: string, carrierName: string, carrierLogoUrl: string|null,
 *   operatingCarrier: string,
 *   flightNumber: string,
 *   aircraftCode: string,
 *   duration: string,
 *   stops: number
 * }}
 */
function mapSegment(seg) {
  const carrier = seg.marketing_carrier
  return {
    id: seg.id,
    departure: {
      iataCode: seg.origin.iata_code,
      terminal: seg.origin_terminal ?? null,
      at: seg.departing_at,
    },
    arrival: {
      iataCode: seg.destination.iata_code,
      terminal: seg.destination_terminal ?? null,
      at: seg.arriving_at,
    },
    carrierCode: carrier.iata_code,
    carrierName: carrier.name,
    carrierLogoUrl: carrier.logo_symbol_url ?? null,
    operatingCarrier: seg.operating_carrier.iata_code,
    flightNumber: `${carrier.iata_code}${seg.marketing_carrier_flight_number}`,
    aircraftCode: seg.aircraft?.iata_code ?? '',
    duration: seg.duration,
    stops: seg.stops?.length ?? 0,
  }
}

/**
 * Map a full Duffel offers response to domain offers,
 * computing deal scores relative to the full result set.
 *
 * @param {{ data: object[] }} response - { data: [...duffelOffers] }
 */
export function mapFlightOffersResponse(response) {
  const { data = [] } = response

  const offers = data.map(raw => mapFlightOffer(raw))
  if (offers.length === 0) return []

  const prices = offers.map(o => o.price)
  const durations = offers.map(o => o.totalDurationMin)
  const maxPrice = Math.max(...prices)
  const maxDuration = Math.max(...durations)

  return offers.map(o => ({
    ...o,
    dealScore: computeDealScore(o, { maxPrice, maxDuration }),
  }))
}
