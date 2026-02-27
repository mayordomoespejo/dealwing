/**
 * Centralized TanStack Query key factory.
 * Using object factories for type-safe, consistent keys.
 */

export const queryKeys = {
  flights: {
    search: params => ['flights', 'search', params],
  },
  locations: {
    search: query => ['locations', 'search', query],
  },
}
