import { useState } from 'react'
import {
  loadResultsAttractionIds,
  saveFavouriteAttractionIds,
  saveTrip,
} from './localTripStorage'
import type { TripPlan } from './tripDates'

export function useTripSelection(
  searchParams: URLSearchParams,
  tripPlan: TripPlan,
) {
  const [favouriteAttractionIds, setFavouriteAttractionIds] = useState(() =>
    loadResultsAttractionIds(searchParams),
  )
  const [saveFeedback, setSaveFeedback] = useState('')

  function toggleFavourite(attractionId: string) {
    setFavouriteAttractionIds((current) => {
      const next = current.includes(attractionId)
        ? current.filter((id) => id !== attractionId)
        : [...current, attractionId]
      saveFavouriteAttractionIds(next)
      return next
    })
    setSaveFeedback('')
  }

  function saveCurrentTrip() {
    const trip = saveTrip({
      ...tripPlan,
      attractionIds: favouriteAttractionIds,
    })
    setSaveFeedback(
      trip
        ? `Trip saved in this browser with ${trip.attractionIds.length} attraction${trip.attractionIds.length === 1 ? '' : 's'}.`
        : 'This browser could not save the trip.',
    )
  }

  return {
    favouriteAttractionIds,
    saveCurrentTrip,
    saveFeedback,
    toggleFavourite,
  }
}
