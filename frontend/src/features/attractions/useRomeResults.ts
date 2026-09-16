import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchRomeAttractions } from '../../shared/api/romeAttractions'
import { fetchRomeBookingPriorities } from '../../shared/api/romeBookingPriorities'
import { fetchRomePlaces } from '../../shared/api/romePlaces'
import { mergeRomeMapPlaces } from './romeMapReferences'

export function useRomeResults({
  enabled,
  stayEndDate,
  stayStartDate,
}: {
  enabled: boolean
  stayEndDate: string
  stayStartDate: string
}) {
  const priorityQuery = useQuery({
    queryKey: ['rome-booking-priorities', stayStartDate, stayEndDate],
    queryFn: () => fetchRomeBookingPriorities(stayStartDate, stayEndDate),
    enabled,
    retry: false,
  })
  const ticketQuery = useQuery({
    queryKey: ['rome-attractions', stayStartDate, stayEndDate],
    queryFn: () => fetchRomeAttractions(stayStartDate, stayEndDate),
    enabled,
    retry: false,
  })
  const placeQuery = useQuery({
    queryKey: ['rome-places'],
    queryFn: fetchRomePlaces,
    enabled,
    retry: false,
  })

  return useMemo(() => {
    const priorities = priorityQuery.data?.priorities ?? []
    const attractions = ticketQuery.data?.attractions ?? []
    const places = placeQuery.data?.attractions ?? []
    const mapPlaces = mergeRomeMapPlaces(places)
    const providerIds = [
      ...priorities.map((priority) => priority.attractionId),
      ...attractions.map((attraction) => attraction.id),
      ...places.map((place) => place.attractionId),
    ]
    const orderedAttractionIds = Array.from(
      new Set(
        providerIds.length > 0
          ? providerIds
          : !priorityQuery.isPending &&
              !ticketQuery.isPending &&
              !placeQuery.isPending
            ? mapPlaces.map((place) => place.attractionId)
            : [],
      ),
    )
    const attractionById = new Map(
      attractions.map((attraction) => [attraction.id, attraction]),
    )
    const priorityById = new Map(
      priorities.map((priority) => [priority.attractionId, priority]),
    )
    const placesByAttractionId = new Map<string, typeof mapPlaces>()
    for (const place of mapPlaces) {
      const current = placesByAttractionId.get(place.attractionId) ?? []
      placesByAttractionId.set(place.attractionId, [...current, place])
    }

    return {
      attractionById,
      mapPlaces,
      orderedAttractionIds,
      placesByAttractionId,
      priorities,
      priorityById,
      priorityError: priorityQuery.error,
      priorityIsError: priorityQuery.isError,
      refetchPriority: priorityQuery.refetch,
      isLoading:
        orderedAttractionIds.length === 0 &&
        (priorityQuery.isPending ||
          ticketQuery.isPending ||
          placeQuery.isPending),
    }
  }, [
    placeQuery.data?.attractions,
    placeQuery.isPending,
    priorityQuery.data?.priorities,
    priorityQuery.error,
    priorityQuery.isError,
    priorityQuery.isPending,
    priorityQuery.refetch,
    ticketQuery.data?.attractions,
    ticketQuery.isPending,
  ])
}
