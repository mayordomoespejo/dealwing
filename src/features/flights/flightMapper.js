import { getAirport } from '@/lib/airports.js'
import { parseDurationMinutes } from '@/lib/formatters.js'
import { computeDealScore } from './dealScore.js'
import { estimateCO2 } from './co2.js'

/**
 * Map a Duffel flight offer to our UI domain model.
 *
 * Domain FlightOffer:
 *   id, origin, destination, price, currency,
 *   outbound { duration, segments[] }, inbound? { duration, segments[] },
 *   totalDurationMin, stops, airlines, airlineNames,
 *   dealScore, co2Kg, isRoundTrip
 */
export function mapFlightOffer(rawOffer) {
  const outboundSlice = rawOffer.slices[0]
  const inboundSlice = rawOffer.slices[1] ?? null

  const outboundSegments = outboundSlice.segments.map(mapSegment)
  const inboundSegments = inboundSlice ? inboundSlice.segments.map(mapSegment) : null

  const originIata = outboundSegments[0].departure.iataCode
  const destIata = outboundSegments.at(-1).arrival.iataCode

  const outDurationMin = parseDurationMinutes(outboundSlice.duration)
  const inDurationMin = inboundSlice ? parseDurationMinutes(inboundSlice.duration) : 0

  const outStops = outboundSegments.length - 1
  const inStops = inboundSegments ? inboundSegments.length - 1 : 0

  // Deduplicated carrier codes and names across all segments
  const allCarrierCodes = [
    ...outboundSegments.map(s => s.carrierCode),
    ...(inboundSegments ?? []).map(s => s.carrierCode),
  ]
  const airlines = [...new Set(allCarrierCodes)]
  const airlineNames = [
    ...new Set([
      ...outboundSegments.map(s => s.carrierName),
      ...(inboundSegments ?? []).map(s => s.carrierName),
    ]),
  ]

  const totalPrice = parseFloat(rawOffer.total_amount)
  const currency = rawOffer.total_currency

  return {
    id: rawOffer.id,
    origin: getAirport(originIata) ?? {
      iata: originIata,
      name: originIata,
      city: originIata,
      country: '',
    },
    destination: getAirport(destIata) ?? {
      iata: destIata,
      name: destIata,
      city: destIata,
      country: '',
    },
    price: totalPrice,
    priceBase: parseFloat(rawOffer.base_amount ?? rawOffer.total_amount),
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
    stops: outStops, // outbound stops (primary sort key)
    airlines,
    airlineNames,
    seatsAvailable: null, // Duffel does not expose available seats on the offer
    isRoundTrip: !!inboundSlice,
    dealScore: 0, // filled after normalization
    co2Kg: estimateCO2(originIata, destIata, outboundSegments, outDurationMin),
    _raw: rawOffer,
  }
}

/**
 * Map a Duffel segment to our domain segment model.
 * Duffel uses snake_case and different field names than Amadeus.
 */
function mapSegment(seg) {
  return {
    id: seg.id,
    departure: {
      iataCode: seg.origin.iata_code,
      terminal: seg.origin.terminal ?? null,
      at: seg.departing_at,
    },
    arrival: {
      iataCode: seg.destination.iata_code,
      terminal: seg.destination.terminal ?? null,
      at: seg.arriving_at,
    },
    carrierCode: seg.marketing_carrier.iata_code,
    carrierName: seg.marketing_carrier.name,
    operatingCarrier: seg.operating_carrier.iata_code,
    flightNumber: `${seg.marketing_carrier.iata_code}${seg.marketing_carrier_flight_number}`,
    aircraftCode: seg.aircraft?.iata_code ?? '',
    duration: seg.duration,
    stops: seg.stops?.length ?? 0, // technical stops within segment
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
