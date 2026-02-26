/**
 * Centralized TanStack Query key factory.
 * Using object factories for type-safe, consistent keys.
 */

export const queryKeys = {
  flights: {
    all: () => ['flights'],
    search: params => ['flights', 'search', params],
  },
  locations: {
    all: () => ['locations'],
    search: query => ['locations', 'search', query],
  },
}
