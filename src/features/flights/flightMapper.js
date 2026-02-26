import { getAirport } from '@/lib/airports.js'
import { parseDurationMinutes } from '@/lib/formatters.js'
import { computeDealScore } from './dealScore.js'
import { estimateCO2 } from './co2.js'

/**
 * Map an Amadeus flight-offer object (+ dictionaries) to our domain model.
 *
 * Domain FlightOffer:
 *   id, origin, destination, price, currency,
 *   outbound { duration, segments[] }, inbound? { duration, segments[] },
 *   totalDurationMin, stops, airlines, dealScore, co2Kg, isRoundTrip
 */
export function mapFlightOffer(rawOffer, dictionaries = {}) {
  const { itineraries, price } = rawOffer

  const outboundItin = itineraries[0]
  const inboundItin = itineraries[1] ?? null

  const outboundSegments = outboundItin.segments.map(s => mapSegment(s, dictionaries))
  const inboundSegments = inboundItin
    ? inboundItin.segments.map(s => mapSegment(s, dictionaries))
    : null

  const originIata = outboundSegments[0].departure.iataCode
  const destIata = outboundSegments.at(-1).arrival.iataCode

  const outDurationMin = parseDurationMinutes(outboundItin.duration)
  const inDurationMin = inboundItin ? parseDurationMinutes(inboundItin.duration) : 0

  const outStops = outboundSegments.length - 1
  const inStops = inboundSegments ? inboundSegments.length - 1 : 0

  // Airlines that appear in the offer
  const allCarriers = [
    ...outboundSegments.map(s => s.carrierCode),
    ...(inboundSegments ?? []).map(s => s.carrierCode),
  ]
  const airlines = [...new Set(allCarriers)]
  const airlineNames = airlines.map(code => dictionaries?.carriers?.[code] ?? code)

  const totalPrice = parseFloat(price.total)
  const currency = price.currency

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
    priceBase: parseFloat(price.base ?? price.total),
    currency,
    outbound: {
      duration: outboundItin.duration,
      durationMin: outDurationMin,
      stops: outStops,
      segments: outboundSegments,
    },
    inbound: inboundItin
      ? {
          duration: inboundItin.duration,
          durationMin: inDurationMin,
          stops: inStops,
          segments: inboundSegments,
        }
      : null,
    totalDurationMin: outDurationMin + inDurationMin,
    stops: outStops, // outbound stops (most relevant for sorting)
    airlines,
    airlineNames,
    seatsAvailable: rawOffer.numberOfBookableSeats,
    isRoundTrip: !!inboundItin,
    dealScore: 0, // filled later after normalization
    co2Kg: estimateCO2(originIata, destIata, outboundSegments, outDurationMin),
    _raw: rawOffer, // keep reference for debugging
  }
}

function mapSegment(seg, dictionaries) {
  const carrierName = dictionaries?.carriers?.[seg.carrierCode] ?? seg.carrierCode

  return {
    id: seg.id,
    departure: {
      iataCode: seg.departure.iataCode,
      terminal: seg.departure.terminal ?? null,
      at: seg.departure.at,
    },
    arrival: {
      iataCode: seg.arrival.iataCode,
      terminal: seg.arrival.terminal ?? null,
      at: seg.arrival.at,
    },
    carrierCode: seg.carrierCode,
    carrierName,
    operatingCarrier: seg.operating?.carrierCode ?? seg.carrierCode,
    flightNumber: `${seg.carrierCode}${seg.number}`,
    aircraftCode: seg.aircraft?.code ?? '',
    duration: seg.duration,
    stops: seg.numberOfStops ?? 0,
  }
}

/**
 * Map an entire Amadeus /v2/shopping/flight-offers response into domain offers,
 * computing deal scores relative to the full result set.
 */
export function mapFlightOffersResponse(response) {
  const { data = [], dictionaries = {} } = response

  // First pass: map all offers
  const offers = data.map(raw => mapFlightOffer(raw, dictionaries))

  // Compute deal scores relative to full set
  const prices = offers.map(o => o.price)
  const durations = offers.map(o => o.totalDurationMin)
  const maxPrice = Math.max(...prices)
  const maxDuration = Math.max(...durations)

  return offers.map(o => ({
    ...o,
    dealScore: computeDealScore(o, { maxPrice, maxDuration }),
  }))
}
