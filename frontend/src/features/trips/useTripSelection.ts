import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createTrip, replaceTrip, type SavedTrip } from '../../shared/api/trips'
import type { TripPlan } from './tripDates'

export function useTripSelection(
  tripPlan: TripPlan,
  tripId: string | undefined,
  initialAttractionIds: string[],
  onTripSaved: (trip: SavedTrip) => void,
) {
  const queryClient = useQueryClient()
  const [favouriteAttractionIds, setFavouriteAttractionIds] =
    useState(initialAttractionIds)
  const [saveFeedback, setSaveFeedback] = useState('')

  const saveTrip = useMutation({
    mutationFn: () =>
      tripId
        ? replaceTrip(tripId, tripPlan, favouriteAttractionIds)
        : createTrip(tripPlan, favouriteAttractionIds),
    onSuccess: (trip) => {
      queryClient.setQueryData(['trip', trip.id], trip)
      onTripSaved(trip)
      setSaveFeedback(
        `Trip saved with ${trip.attractionIds.length} attraction${trip.attractionIds.length === 1 ? '' : 's'}.`,
      )
    },
  })

  function toggleFavourite(attractionId: string) {
    setFavouriteAttractionIds((current) => {
      const next = current.includes(attractionId)
        ? current.filter((id) => id !== attractionId)
        : [...current, attractionId]
      return next
    })
    setSaveFeedback('')
  }

  function saveCurrentTrip() {
    saveTrip.mutate()
  }

  return {
    favouriteAttractionIds,
    saveCurrentTrip,
    saveFeedback,
    saveError: saveTrip.error,
    isSaving: saveTrip.isPending,
    toggleFavourite,
  }
}
