import { useQuery } from '@tanstack/react-query'
import { fetchTrip } from '../../shared/api/trips'

export function useSavedTrip(tripId?: string) {
  return useQuery({
    enabled: Boolean(tripId),
    queryFn: () => fetchTrip(tripId!),
    queryKey: ['trip', tripId],
    retry: false,
  })
}
