import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AttractionCard } from '../features/attractions/AttractionCard'
import { AttractionDetailsDialog } from '../features/attractions/AttractionDetailsDialog'
import { RomeResultsMap } from '../features/attractions/RomeResultsMap'
import { flexibleDateCopy } from '../features/attractions/resultPresentation'
import { useRomeResults } from '../features/attractions/useRomeResults'
import { useTripSelection } from '../features/trips/useTripSelection'
import { useSavedTrip } from '../features/trips/useSavedTrip'
import { parseTripQuery, type TripPlan } from '../features/trips/tripDates'
import type { SavedTrip } from '../shared/api/trips'

const INITIAL_VISIBLE_ATTRACTION_COUNT = 10
const LOAD_MORE_ATTRACTION_COUNT = 8

export function ResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tripId = searchParams.get('tripId') ?? undefined
  const savedTrip = useSavedTrip(tripId)
  const parsedTrip = parseTripQuery(searchParams)

  if (tripId && savedTrip.isPending) {
    return (
      <section className="page-section results-section">
        <div className="result-state" role="status">
          <strong>Loading saved trip...</strong>
        </div>
      </section>
    )
  }

  if (tripId && savedTrip.isError) {
    return (
      <section className="page-section results-section">
        <h1>Saved trip unavailable.</h1>
        <p className="intro">
          {savedTrip.error instanceof Error
            ? savedTrip.error.message
            : 'The saved trip could not be loaded.'}
        </p>
        <Link className="button button-secondary" to="/plan">
          Plan a Rome stay
        </Link>
      </section>
    )
  }

  const tripPlan = savedTrip.data
    ? tripPlanFromSavedTrip(savedTrip.data)
    : parsedTrip.success
      ? parsedTrip.data
      : undefined

  if (!tripPlan) {
    return (
      <section className="page-section results-section">
        <h1>Choose your stay first.</h1>
        <p className="intro">
          Rome and both stay dates are required before attraction evidence can
          be requested.
        </p>
        <Link className="button button-secondary" to="/plan">
          Plan a Rome stay
        </Link>
      </section>
    )
  }

  return (
    <ResultsPageContent
      initialAttractionIds={savedTrip.data?.attractionIds ?? []}
      onTripSaved={(trip) => {
        const nextParams = tripParams(trip)
        setSearchParams(nextParams)
      }}
      tripId={tripId}
      tripPlan={tripPlan}
    />
  )
}

function tripPlanFromSavedTrip(trip: SavedTrip): TripPlan {
  return {
    city: trip.city,
    dateMode: trip.dateMode,
    lengthFlexDays: trip.lengthFlexDays ?? undefined,
    stayEndDate: trip.stayEndDate,
    stayStartDate: trip.stayStartDate,
    travelMonth: trip.travelMonth ?? undefined,
    tripLengthDays: trip.tripLengthDays ?? undefined,
  }
}

function tripParams(trip: SavedTrip) {
  const plan = tripPlanFromSavedTrip(trip)
  const params = new URLSearchParams({
    city: plan.city,
    dateMode: plan.dateMode,
    stayEndDate: plan.stayEndDate,
    stayStartDate: plan.stayStartDate,
    tripId: trip.id,
  })

  if (plan.dateMode === 'flexible') {
    params.set('travelMonth', plan.travelMonth!)
    params.set('tripLengthDays', String(plan.tripLengthDays))
    params.set('lengthFlexDays', String(plan.lengthFlexDays))
  }

  return params
}

function ResultsPageContent({
  initialAttractionIds,
  onTripSaved,
  tripId,
  tripPlan,
}: {
  initialAttractionIds: string[]
  onTripSaved: (trip: SavedTrip) => void
  tripId?: string
  tripPlan: TripPlan
}) {
  const [detailAttractionId, setDetailAttractionId] = useState<string>()
  const [selectedAttractionId, setSelectedAttractionId] = useState<string>()
  const [visibleAttractionCount, setVisibleAttractionCount] = useState(
    INITIAL_VISIBLE_ATTRACTION_COUNT,
  )
  const {
    favouriteAttractionIds,
    saveCurrentTrip,
    saveFeedback,
    saveError,
    isSaving,
    toggleFavourite,
  } = useTripSelection(tripPlan, tripId, initialAttractionIds, onTripSaved)
  const {
    attractionById,
    isLoading,
    mapPlaces,
    orderedAttractionIds,
    placesByAttractionId,
    priorities,
    priorityById,
    priorityError,
    priorityIsError,
    refetchPriority,
  } = useRomeResults({
    enabled: true,
    stayEndDate: tripPlan.stayEndDate,
    stayStartDate: tripPlan.stayStartDate,
  })
  const flexibleDates = flexibleDateCopy(
    tripPlan.travelMonth,
    tripPlan.tripLengthDays,
    tripPlan.lengthFlexDays,
  )
  const visibleAttractionIds = orderedAttractionIds.slice(
    0,
    visibleAttractionCount,
  )
  const hasMoreAttractions =
    visibleAttractionIds.length < orderedAttractionIds.length

  return (
    <section className="page-section results-section" aria-live="polite">
      <header className="results-header">
        <div>
          <p className="eyebrow">Rome booking plan</p>
          <h1>What should I book first?</h1>
        </div>
        <div className="results-plan-actions">
          <p className="results-date-range">
            {flexibleDates ? (
              <strong>{flexibleDates}</strong>
            ) : (
              <>
                <span>
                  {tripPlan.dateMode === 'flexible' ? 'Flexible window: ' : ''}
                </span>
                <strong>{tripPlan.stayStartDate}</strong> to{' '}
                <strong>{tripPlan.stayEndDate}</strong>
              </>
            )}
          </p>
          <Link
            className="button button-secondary results-change-dates"
            to="/plan"
          >
            Change dates
          </Link>
        </div>
      </header>

      {priorities.length > 0 ? (
        <p className="results-planning-note">
          Targets use the first day of your travel window. Availability is not
          confirmed, so check the official source before booking.
        </p>
      ) : null}

      {isLoading ? (
        <div className="result-state" role="status">
          <strong>Building your booking order...</strong>
          <p>
            Official, location and third-party sources are checked separately.
          </p>
        </div>
      ) : null}

      {priorityIsError ? (
        <div className="result-state result-state-error" role="alert">
          <strong>Booking priority is temporarily unavailable.</strong>
          <p>
            {priorityError instanceof Error
              ? priorityError.message
              : 'The booking priority service could not complete this request.'}
          </p>
          <p>No urgency is inferred from third-party ticket data.</p>
          <button
            className="button button-secondary"
            onClick={() => refetchPriority()}
            type="button"
          >
            Retry booking priority
          </button>
        </div>
      ) : null}

      {!isLoading && orderedAttractionIds.length > 0 ? (
        <div className="results-layout">
          <section aria-label="Rome attraction results" className="result-list">
            <header className="result-list-header">
              <div>
                <strong>
                  {orderedAttractionIds.length} attractions in booking order
                </strong>
                <span>
                  {favouriteAttractionIds.length} selected for this trip
                </span>
              </div>
              <button
                className="button button-primary result-save-trip"
                disabled={favouriteAttractionIds.length === 0 || isSaving}
                onClick={saveCurrentTrip}
                type="button"
              >
                {isSaving
                  ? 'Saving trip...'
                  : tripId
                    ? 'Save changes'
                    : 'Save trip'}
              </button>
            </header>
            {saveFeedback ? (
              <p className="result-save-feedback" role="status">
                {saveFeedback}
              </p>
            ) : null}
            {saveError ? (
              <p className="result-save-feedback" role="alert">
                {saveError instanceof Error
                  ? saveError.message
                  : 'The trip could not be saved. Please try again.'}
              </p>
            ) : null}
            {visibleAttractionIds.map((attractionId) => (
              <AttractionCard
                attraction={attractionById.get(attractionId)}
                isFavourite={favouriteAttractionIds.includes(attractionId)}
                isSelected={selectedAttractionId === attractionId}
                key={attractionId}
                onOpen={() => setDetailAttractionId(attractionId)}
                onSelect={() => setSelectedAttractionId(attractionId)}
                onToggleFavourite={() => toggleFavourite(attractionId)}
                places={placesByAttractionId.get(attractionId) ?? []}
                priority={priorityById.get(attractionId)}
                stayStartDate={tripPlan.stayStartDate}
              />
            ))}
            {hasMoreAttractions ? (
              <div className="result-list-load-more">
                <button
                  className="button button-secondary"
                  onClick={() =>
                    setVisibleAttractionCount(
                      (current) => current + LOAD_MORE_ATTRACTION_COUNT,
                    )
                  }
                  type="button"
                >
                  Show more attractions
                </button>
                <span>
                  Showing {visibleAttractionIds.length} of{' '}
                  {orderedAttractionIds.length} attractions
                </span>
              </div>
            ) : null}
          </section>
          <RomeResultsMap
            places={mapPlaces}
            selectedAttractionId={selectedAttractionId}
          />
        </div>
      ) : null}

      {detailAttractionId ? (
        <AttractionDetailsDialog
          attraction={attractionById.get(detailAttractionId)}
          key={detailAttractionId}
          onClose={() => setDetailAttractionId(undefined)}
          places={placesByAttractionId.get(detailAttractionId) ?? []}
          priority={priorityById.get(detailAttractionId)}
          stayStartDate={tripPlan.stayStartDate}
        />
      ) : null}

      {!isLoading && orderedAttractionIds.length === 0 ? (
        <div className="result-state">
          <strong>No attraction evidence was returned.</strong>
          <p>This does not mean every Rome attraction is unavailable.</p>
        </div>
      ) : null}
    </section>
  )
}
