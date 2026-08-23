import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { RomeResultsMap } from '../features/attractions/RomeResultsMap'
import {
  fetchRomeAttractions,
  type RomeAttraction,
} from '../shared/api/romeAttractions'
import {
  fetchRomeBookingPriorities,
  type RomeBookingPriority,
} from '../shared/api/romeBookingPriorities'
import { fetchRomePlaces, type RomePlace } from '../shared/api/romePlaces'

function formatPrice(attraction: RomeAttraction) {
  const price = attraction.prices[0]
  if (!price) return null

  const amount = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: price.currency,
  }).format(price.amount)

  return `${price.kind === 'FROM' ? 'From ' : ''}${amount}`
}

function formatRetrievedAt(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function priorityCopy(priority: RomeBookingPriority['priority']) {
  switch (priority) {
    case 'BOOK_FIRST':
      return 'Book first'
    case 'BOOK_SOON':
      return 'Book soon'
    case 'CAN_WAIT':
      return 'Can wait'
    default:
      return 'Check official source'
  }
}

function timingCopy(timing: RomeBookingPriority['timing']) {
  switch (timing) {
    case 'AS_SOON_AS_VISIT_DATE_IS_FIXED':
      return 'As soon as your visit date is fixed'
    case 'BEFORE_FINALISING_DAILY_PLAN':
      return 'Before finalising each day'
    case 'AFTER_HIGHER_PRIORITY_TICKETS':
      return 'After higher-priority tickets'
    default:
      return 'Check the official booking page'
  }
}

function confidenceCopy(confidence: RomeBookingPriority['confidence']) {
  return `${confidence.charAt(0)}${confidence.slice(1).toLowerCase()} confidence`
}

function availabilityCopy(status: RomeAttraction['availabilityStatus']) {
  switch (status) {
    case 'SCHEDULED':
      return {
        title: 'Published schedule found',
        detail:
          'The provider returned scheduled dates. This is not a live inventory guarantee.',
      }
    case 'UNAVAILABLE':
      return {
        title: 'No provider schedule found',
        detail: 'The provider did not return a schedule for these stay dates.',
      }
    case 'REQUEST_FAILED':
      return {
        title: 'Provider request failed',
        detail: 'No availability conclusion can be drawn from this request.',
      }
    default:
      return {
        title: 'Schedule unknown',
        detail: 'The available evidence is not enough to describe scheduling.',
      }
  }
}

function businessStatusCopy(status: string | null) {
  if (status === 'OPERATIONAL') return 'Operational in Google Places'
  if (status === 'CLOSED_TEMPORARILY') {
    return 'Marked temporarily closed in Google Places'
  }
  if (status === 'CLOSED_PERMANENTLY') {
    return 'Marked permanently closed in Google Places'
  }
  return 'Business status not returned'
}

function offeringTypeCopy(type: RomeAttraction['offeringType']) {
  if (type === 'GUIDED_TOUR') {
    return {
      label: 'Guided tour',
      detail:
        'This affiliate product is a guided experience. It is not the official basic admission ticket.',
    }
  }
  if (type === 'TICKET_PRODUCT') {
    return {
      label: 'Affiliate ticket product',
      detail:
        'The available options must be checked on the provider page before booking.',
    }
  }
  if (type === 'TICKET_WITH_AUDIO_GUIDE') {
    return {
      label: 'Ticket with audio guide',
      detail:
        'This affiliate bundle includes admission and a digital audio guide. It is not the official basic admission ticket.',
    }
  }
  return {
    label: 'Product type not classified',
    detail: 'No product type is inferred from incomplete evidence.',
  }
}

function attractionName(
  attraction: RomeAttraction | undefined,
  places: RomePlace[],
  priority: RomeBookingPriority | undefined,
) {
  return (
    priority?.attractionName ??
    attraction?.name ??
    places[0]?.name ??
    'Verified Rome attraction'
  )
}

function AttractionEvidenceCard({
  attraction,
  isSelected,
  onOpen,
  onSelect,
  places,
  priority,
}: {
  attraction?: RomeAttraction
  isSelected: boolean
  onOpen: () => void
  onSelect: () => void
  places: RomePlace[]
  priority?: RomeBookingPriority
}) {
  const name = attractionName(attraction, places, priority)
  const price = attraction ? formatPrice(attraction) : null
  const priorityLabel = priority
    ? priorityCopy(priority.priority)
    : 'Priority unavailable'
  const timingLabel = priority
    ? timingCopy(priority.timing)
    : 'Official guidance unavailable'
  const priorityTone =
    priority?.priority.toLowerCase().replaceAll('_', '-') ?? 'unavailable'

  return (
    <article
      className={`result-card result-card-priority-${priorityTone}${isSelected ? ' result-card-selected' : ''}`}
    >
      <div className="result-card-summary">
        <div className="result-card-heading">
          <div>
            <span className={`booking-priority-badge priority-${priorityTone}`}>
              {priorityLabel}
            </span>
            <h2>{name}</h2>
          </div>
        </div>

        <div className="result-card-glance">
          <span>
            <small>When to act</small>
            <strong>{timingLabel}</strong>
          </span>
          <span>
            <small>Official basis</small>
            <strong>
              {priority ? confidenceCopy(priority.confidence) : 'Unavailable'}
            </strong>
          </span>
          <span>
            <small>Third-party option</small>
            <strong>{price ?? 'Unavailable'}</strong>
          </span>
        </div>

        <div className="result-card-actions">
          <button
            aria-label={`View details for ${name}`}
            className="result-details-button"
            onClick={onOpen}
            type="button"
          >
            View details
            <span aria-hidden="true">+</span>
          </button>
          {places.length > 0 ? (
            <button
              aria-pressed={isSelected}
              className="result-map-focus"
              onClick={onSelect}
              type="button"
            >
              {isSelected ? 'Shown on map' : 'Show on map'}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  )
}

function AttractionEvidenceDetails({
  attraction,
  places,
  priority,
}: {
  attraction?: RomeAttraction
  places: RomePlace[]
  priority?: RomeBookingPriority
}) {
  const availability = attraction
    ? availabilityCopy(attraction.availabilityStatus)
    : null
  const offering = attraction ? offeringTypeCopy(attraction.offeringType) : null
  const price = attraction ? formatPrice(attraction) : null

  return (
    <div className="result-card-body">
      <section
        className="result-evidence-section result-priority-section"
        aria-label="Official booking priority"
      >
        <div className="result-evidence-heading">
          <h3>Official booking guidance</h3>
          <span className="official-source-badge">Official source</span>
        </div>
        {priority ? (
          <>
            <div className="priority-guidance">
              <div>
                <small>Recommended action</small>
                <strong>{priority.action}</strong>
              </div>
              <div>
                <small>Planning timing</small>
                <strong>{timingCopy(priority.timing)}</strong>
              </div>
            </div>
            <p className="priority-explanation">{priority.explanation}</p>
            <p className="official-factual-basis">
              {priority.officialEvidence.factualBasis}
            </p>
            <p className="result-source">
              Official operator evidence
              {' · '}Checked {priority.officialEvidence.checkedOn}
              {' · '}
              {confidenceCopy(priority.confidence)}
              {' · '}Rule {priority.ruleVersion}
              {' · '}
              <a
                href={priority.officialEvidence.sourceUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open official source
              </a>
            </p>
          </>
        ) : (
          <p className="result-provider-fallback">
            Booking priority is temporarily unavailable. No urgency is inferred
            from third-party ticket data.
          </p>
        )}
      </section>

      <section
        className="result-evidence-section result-location-section"
        aria-label="Location evidence"
      >
        <div className="result-evidence-heading">
          <h3>Location evidence</h3>
          <span className="source-badge source-badge-location">
            Google Places
          </span>
        </div>
        {places.length > 0 ? (
          <>
            {places.length > 1 ? (
              <p className="result-group-summary">
                This attraction group contains {places.length} separately
                verified locations.
              </p>
            ) : null}
            <div className="result-place-list">
              {places.map((place) => (
                <div className="result-place" key={place.componentId}>
                  {places.length > 1 ? <h4>{place.name}</h4> : null}
                  <dl className="result-facts result-location-facts">
                    <div>
                      <dt>Address</dt>
                      <dd>
                        <strong>{place.formattedAddress}</strong>
                        <span>Returned for the verified Google Place ID.</span>
                      </dd>
                    </div>
                    <div>
                      <dt>Place status</dt>
                      <dd>
                        <strong>
                          {businessStatusCopy(place.businessStatus)}
                        </strong>
                        <span>This is not a ticket or live crowd status.</span>
                      </dd>
                    </div>
                  </dl>
                  <p className="result-source">
                    Location source: Google Places
                    {' · '}Retrieved {formatRetrievedAt(place.retrievedAt)} UTC
                    {place.googleMapsUri ? (
                      <>
                        {' · '}
                        <a
                          href={place.googleMapsUri}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open {place.name} in Google Maps
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="result-provider-fallback">
            Verified location evidence is temporarily unavailable. No location
            or closure conclusion is inferred.
          </p>
        )}
      </section>

      <section
        className="result-evidence-section result-third-party-section"
        aria-label="Third-party ticket evidence"
      >
        <div className="result-evidence-heading">
          <h3>Third-party ticket option</h3>
          <span className="source-badge source-badge-third-party">
            Viator Sandbox
          </span>
        </div>
        {attraction && availability ? (
          <>
            <dl className="result-facts">
              <div>
                <dt>Provider product type</dt>
                <dd>
                  <strong>{offering?.label}</strong>
                  <span>{offering?.detail}</span>
                </dd>
              </div>
              <div>
                <dt>Provider schedule</dt>
                <dd>
                  <strong>{availability.title}</strong>
                  <span>{availability.detail}</span>
                </dd>
              </div>
              <div>
                <dt>Price evidence</dt>
                <dd>
                  <strong>{price ?? 'No summary price returned'}</strong>
                  <span>Sandbox summary price, not a live quote.</span>
                </dd>
              </div>
              <div>
                <dt>Provider reservation evidence</dt>
                <dd>
                  <strong>{attraction.reservationRequirement}</strong>
                  <span>
                    This provider field does not set the official booking
                    priority.
                  </span>
                </dd>
              </div>
            </dl>
            <p className="result-source">
              Third-party source: {attraction.source.provider}{' '}
              {attraction.source.environment}
              {' · '}Retrieved{' '}
              {formatRetrievedAt(attraction.source.retrievedAt)} UTC
              {' · '}
              {attraction.source.freshness.toLowerCase()}
            </p>
          </>
        ) : (
          <p className="result-provider-fallback">
            No Viator Sandbox option is mapped for this attraction. This is not
            treated as sold out.
          </p>
        )}
      </section>
    </div>
  )
}

function AttractionDetailsDialog({
  attraction,
  onClose,
  places,
  priority,
}: {
  attraction?: RomeAttraction
  onClose: () => void
  places: RomePlace[]
  priority?: RomeBookingPriority
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const name = attractionName(attraction, places, priority)
  const priorityTone =
    priority?.priority.toLowerCase().replaceAll('_', '-') ?? 'unavailable'

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (typeof dialog.showModal === 'function') {
      dialog.showModal()
    } else {
      dialog.setAttribute('open', '')
    }
    return () => {
      dialog.removeAttribute('open')
    }
  }, [])

  return (
    <dialog
      aria-labelledby="attraction-dialog-title"
      className="attraction-dialog"
      onCancel={onClose}
      ref={dialogRef}
    >
      <div className="attraction-dialog-shell">
        <header className="attraction-dialog-header">
          <div>
            <span className={`booking-priority-badge priority-${priorityTone}`}>
              {priority
                ? priorityCopy(priority.priority)
                : 'Priority unavailable'}
            </span>
            <h2 id="attraction-dialog-title">{name}</h2>
          </div>
          <button
            aria-label={`Close details for ${name}`}
            className="attraction-dialog-close"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </header>
        <AttractionEvidenceDetails
          attraction={attraction}
          places={places}
          priority={priority}
        />
      </div>
    </dialog>
  )
}

export function ResultsPage() {
  const [detailAttractionId, setDetailAttractionId] = useState<
    string | undefined
  >()
  const [selectedAttractionId, setSelectedAttractionId] = useState<
    string | undefined
  >()
  const [searchParams] = useSearchParams()
  const city = searchParams.get('city')
  const startDate = searchParams.get('stayStartDate')
  const endDate = searchParams.get('stayEndDate')
  const hasValidQuery = city === 'rome' && Boolean(startDate && endDate)

  const priorityQuery = useQuery({
    queryKey: ['rome-booking-priorities', startDate, endDate],
    queryFn: () => fetchRomeBookingPriorities(startDate!, endDate!),
    enabled: hasValidQuery,
    retry: false,
  })
  const ticketQuery = useQuery({
    queryKey: ['rome-attractions', startDate, endDate],
    queryFn: () => fetchRomeAttractions(startDate!, endDate!),
    enabled: hasValidQuery,
    retry: false,
  })
  const placeQuery = useQuery({
    queryKey: ['rome-places'],
    queryFn: fetchRomePlaces,
    enabled: hasValidQuery,
    retry: false,
  })

  if (!hasValidQuery) {
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

  const priorities = priorityQuery.data?.priorities ?? []
  const attractions = ticketQuery.data?.attractions ?? []
  const places = placeQuery.data?.attractions ?? []
  const orderedAttractionIds = [
    ...priorities.map((priority) => priority.attractionId),
    ...attractions.map((attraction) => attraction.id),
    ...places.map((place) => place.attractionId),
  ].filter((id, index, ids) => ids.indexOf(id) === index)
  const isLoading =
    priorityQuery.isPending || ticketQuery.isPending || placeQuery.isPending

  return (
    <section className="page-section results-section" aria-live="polite">
      <header className="results-header">
        <div>
          <p className="eyebrow">Rome booking plan</p>
          <h1>What should I book first?</h1>
          <p className="results-date-range">
            <strong>{startDate}</strong> to <strong>{endDate}</strong>
          </p>
        </div>
        <Link className="button button-secondary" to="/plan">
          Change dates
        </Link>
      </header>

      {isLoading ? (
        <div className="result-state" role="status">
          <strong>Building your booking order...</strong>
          <p>
            Official, location and third-party sources are checked separately.
          </p>
        </div>
      ) : null}

      {priorityQuery.isError ? (
        <div className="result-state result-state-error" role="alert">
          <strong>Booking priority is temporarily unavailable.</strong>
          <p>{priorityQuery.error.message}</p>
          <p>No urgency is inferred from third-party ticket data.</p>
          <button
            className="button button-secondary"
            onClick={() => priorityQuery.refetch()}
          >
            Retry booking priority
          </button>
        </div>
      ) : null}

      {placeQuery.isError ? (
        <div className="result-state result-state-error" role="alert">
          <strong>Location evidence is temporarily unavailable.</strong>
          <p>{placeQuery.error.message}</p>
          <p>No location or closure conclusion is inferred.</p>
          <button
            className="button button-secondary"
            onClick={() => placeQuery.refetch()}
          >
            Retry location evidence
          </button>
        </div>
      ) : null}

      {!isLoading && orderedAttractionIds.length > 0 ? (
        <div className="results-layout">
          <section aria-label="Rome attraction results" className="result-list">
            <header className="result-list-header">
              <strong>
                {orderedAttractionIds.length} attractions in booking order
              </strong>
            </header>
            {orderedAttractionIds.map((attractionId) => (
              <AttractionEvidenceCard
                attraction={attractions.find(
                  (attraction) => attraction.id === attractionId,
                )}
                isSelected={selectedAttractionId === attractionId}
                key={attractionId}
                onOpen={() => setDetailAttractionId(attractionId)}
                onSelect={() => setSelectedAttractionId(attractionId)}
                places={places.filter(
                  (place) => place.attractionId === attractionId,
                )}
                priority={priorities.find(
                  (priority) => priority.attractionId === attractionId,
                )}
              />
            ))}
          </section>
          <RomeResultsMap
            places={places}
            selectedAttractionId={selectedAttractionId}
          />
        </div>
      ) : null}

      {detailAttractionId ? (
        <AttractionDetailsDialog
          attraction={attractions.find(
            (attraction) => attraction.id === detailAttractionId,
          )}
          key={detailAttractionId}
          onClose={() => setDetailAttractionId(undefined)}
          places={places.filter(
            (place) => place.attractionId === detailAttractionId,
          )}
          priority={priorities.find(
            (priority) => priority.attractionId === detailAttractionId,
          )}
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
