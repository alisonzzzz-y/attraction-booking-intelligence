import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AttractionCard } from '../features/attractions/AttractionCard'
import { AttractionDetailsDialog } from '../features/attractions/AttractionDetailsDialog'
import { RomeResultsMap } from '../features/attractions/RomeResultsMap'
import { flexibleDateCopy } from '../features/attractions/resultPresentation'
import { useRomeResults } from '../features/attractions/useRomeResults'
import { useTripSelection } from '../features/trips/useTripSelection'
import { parseTripQuery, type TripPlan } from '../features/trips/tripDates'

const INITIAL_VISIBLE_ATTRACTION_COUNT = 10
const LOAD_MORE_ATTRACTION_COUNT = 8

export function ResultsPage() {
  const [searchParams] = useSearchParams()
  const parsedTrip = parseTripQuery(searchParams)

  if (!parsedTrip.success) {
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
      key={searchParams.toString()}
      searchParams={searchParams}
      tripPlan={parsedTrip.data}
    />
  )
}

function ResultsPageContent({
  searchParams,
  tripPlan,
}: {
  searchParams: URLSearchParams
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
    toggleFavourite,
  } = useTripSelection(searchParams, tripPlan)
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
          Booking targets are estimates based on the first day of your travel
          window. Official release dates are shown separately. Availability is
          not confirmed.
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
                  {favouriteAttractionIds.length} saved in this browser
                </span>
              </div>
              <button
                className="button button-primary result-save-trip"
                disabled={favouriteAttractionIds.length === 0}
                onClick={saveCurrentTrip}
                type="button"
              >
                Save trip
              </button>
            </header>
            {saveFeedback ? (
              <p className="result-save-feedback" role="status">
                {saveFeedback}
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
