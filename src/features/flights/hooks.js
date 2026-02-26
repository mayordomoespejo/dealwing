import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys.js'
import { searchFlightOffers } from './api.js'
import { mapFlightOffersResponse } from './flightMapper.js'

/**
 * TanStack Query hook for flight search.
 * Only runs when searchParams is non-null.
 *
 * @param {object|null} searchParams - validated search form values
 */
export function useFlightSearch(searchParams) {
  return useQuery({
    queryKey: queryKeys.flights.search(searchParams),
    queryFn: async () => {
      const raw = await searchFlightOffers(searchParams)
      return mapFlightOffersResponse(raw)
    },
    enabled: !!searchParams,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    select: data => data,
  })
}
