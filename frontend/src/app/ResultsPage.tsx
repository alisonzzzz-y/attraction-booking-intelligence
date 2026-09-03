import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { RomeResultsMap } from '../features/attractions/RomeResultsMap'
import { mergeRomeMapPlaces } from '../features/attractions/romeMapReferences'
import {
  loadFavouriteAttractionIds,
  saveFavouriteAttractionIds,
  saveTrip,
  type TripDateMode,
} from '../features/trips/localTripStorage'
import {
  fetchRomeAttractions,
  type RomeAttraction,
} from '../shared/api/romeAttractions'
import {
  fetchRomeBookingPriorities,
  type RomeBookingPriority,
} from '../shared/api/romeBookingPriorities'
import {
  fetchRomeBookingExplanation,
  type RomeBookingExplanation,
} from '../shared/api/romeBookingExplanation'
import { fetchRomePlaces, type RomePlace } from '../shared/api/romePlaces'
import {
  localPhotosForAttraction,
  type LocalAttractionPhoto,
} from '../features/attractions/romeLocalPhotos'

const INITIAL_VISIBLE_ATTRACTION_COUNT = 10
const LOAD_MORE_ATTRACTION_COUNT = 8

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

function positiveInteger(value: string | null) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

function nonNegativeInteger(value: string | null) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : undefined
}

function flexibleDateCopy(
  travelMonth: string | null,
  tripLengthDays: number | undefined,
  lengthFlexDays: number | undefined,
) {
  if (!travelMonth || !tripLengthDays || lengthFlexDays === undefined) {
    return null
  }

  const month = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${travelMonth}-01T00:00:00Z`))
  const flexibility =
    lengthFlexDays === 0
      ? 'exact trip length'
      : `trip length flexible by ±${lengthFlexDays} day${lengthFlexDays === 1 ? '' : 's'}`

  return `Around ${tripLengthDays} days in ${month}, ${flexibility}`
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

function formatPlanningDate(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(value))
}

function officialPolicyCopy(
  policy: RomeBookingPriority['officialEvidence']['policy'],
) {
  switch (policy) {
    case 'TIMED_RESERVATION_REQUIRED':
      return 'Timed entry required'
    case 'ADVANCE_BOOKING_RECOMMENDED':
      return 'Advance booking advised'
    case 'NO_ADVANCE_RESERVATION_REQUIRED':
      return 'No advance booking required'
    case 'FREE_GENERAL_ENTRY':
      return 'Free general entry'
    case 'OPTIONAL_PAID_AREA':
      return 'Optional paid area'
    default:
      return 'Ticket timing not published'
  }
}

function bookingGuidance(priority: RomeBookingPriority, stayStartDate: string) {
  const tripStartDate = formatPlanningDate(`${stayStartDate}T00:00:00Z`)

  switch (priority.priority) {
    case 'BOOK_FIRST':
      return {
        summary: 'Book today',
        note: 'ABI planning recommendation. The official source requires a timed reservation but does not publish a verified sell-out deadline.',
      }
    case 'BOOK_SOON':
      return {
        summary: `Book by ${tripStartDate}`,
        note: 'ABI planning recommendation. The official source advises booking ahead, but current evidence does not support a precise sell-out window.',
      }
    case 'CAN_WAIT':
      switch (priority.officialEvidence.policy) {
        case 'FREE_GENERAL_ENTRY':
          return {
            summary: 'Walk in for ordinary entry',
            note: 'Ordinary entry is free. Choose the optional paid reservation only if you want a guaranteed time and the included audio guide.',
          }
        case 'NO_ADVANCE_RESERVATION_REQUIRED':
          return {
            summary: 'A same-day visit is a practical option',
            note: 'The official policy says an ordinary visit does not require a reservation. You can decide on the day, but check opening conditions before travelling.',
          }
        case 'OPTIONAL_PAID_AREA':
          return {
            summary: 'Walk in for the free exterior view',
            note: 'The normal exterior view is free. Buy a separate ticket only if you want the enclosed inner area.',
          }
        default:
          return {
            summary: 'Plan this after higher-priority tickets',
            note: 'The official rule does not require advance booking for the ordinary visit described here. Recheck the official website before travel.',
          }
      }
    default:
      return {
        summary: 'Check today',
        note: 'No verified booking deadline is available. Check the official website before making the rest of your plan.',
      }
  }
}

function explanationModeCopy(mode: RomeBookingExplanation['mode']) {
  return mode === 'MODEL'
    ? 'AI explanation, constrained by verified facts'
    : 'Rule-based explanation while AI is unavailable'
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

function LocalPhotoAttribution({ photo }: { photo: LocalAttractionPhoto }) {
  return (
    <span className="place-photo-attribution">
      Photo credit:{' '}
      <a
        href={photo.sourceUrl}
        onClick={(event) => event.stopPropagation()}
        rel="noreferrer"
        target="_blank"
      >
        {photo.author}
      </a>
      {' · '}
      <a
        href={photo.licenseUrl}
        onClick={(event) => event.stopPropagation()}
        rel="noreferrer"
        target="_blank"
      >
        {photo.license}
      </a>
    </span>
  )
}

function AttractionEvidenceCard({
  attraction,
  isFavourite,
  isSelected,
  onOpen,
  onSelect,
  onToggleFavourite,
  places,
  priority,
  stayStartDate,
}: {
  attraction?: RomeAttraction
  isFavourite: boolean
  isSelected: boolean
  onOpen: () => void
  onSelect: () => void
  onToggleFavourite: () => void
  places: RomePlace[]
  priority?: RomeBookingPriority
  stayStartDate: string
}) {
  const name = attractionName(attraction, places, priority)
  const attractionId =
    attraction?.id ?? priority?.attractionId ?? places[0]?.attractionId
  const previewPhoto = localPhotosForAttraction(attractionId)[0]
  const price = attraction ? formatPrice(attraction) : null
  const thirdPartyOptionStatus = price ?? 'Coming soon'
  const priorityLabel = priority
    ? priorityCopy(priority.priority)
    : 'Priority unavailable'
  const deadline = priority
    ? bookingGuidance(priority, stayStartDate)
    : undefined
  const priorityTone =
    priority?.priority.toLowerCase().replaceAll('_', '-') ?? 'unavailable'
  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (
      event.target !== event.currentTarget ||
      (event.key !== 'Enter' && event.key !== ' ')
    ) {
      return
    }

    event.preventDefault()
    onSelect()
  }

  return (
    <article
      aria-current={isSelected ? 'true' : undefined}
      aria-label={`Focus ${name} on map`}
      className={`result-card result-card-priority-${priorityTone} result-card-mappable${isSelected ? ' result-card-selected' : ''}`}
      onClick={onSelect}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
    >
      {previewPhoto ? (
        <figure className="result-card-photo">
          <img alt={previewPhoto.alt} loading="lazy" src={previewPhoto.src} />
          <figcaption>
            <LocalPhotoAttribution photo={previewPhoto} />
          </figcaption>
        </figure>
      ) : (
        <div className="result-card-photo result-card-photo-placeholder">
          <span>Photo unavailable</span>
        </div>
      )}
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
            <small>Recommended action</small>
            <strong>{deadline?.summary ?? 'Guidance unavailable'}</strong>
          </span>
          <span>
            <small>Official rule</small>
            <strong>
              {priority
                ? officialPolicyCopy(priority.officialEvidence.policy)
                : 'Unavailable'}
            </strong>
          </span>
          <span>
            <small>Third-party options</small>
            <strong>{thirdPartyOptionStatus}</strong>
          </span>
        </div>

        <div className="result-card-actions">
          <button
            aria-label={`${isFavourite ? 'Remove' : 'Save'} ${name}`}
            aria-pressed={isFavourite}
            className={`result-save-button${isFavourite ? ' saved' : ''}`}
            onClick={(event) => {
              event.stopPropagation()
              onToggleFavourite()
            }}
            type="button"
          >
            <span aria-hidden="true">{isFavourite ? '★' : '☆'}</span>
            {isFavourite ? 'Saved' : 'Save'}
          </button>
          <button
            aria-label={`View details for ${name}`}
            className="result-details-button"
            onClick={(event) => {
              event.stopPropagation()
              onOpen()
            }}
            type="button"
          >
            View details
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </article>
  )
}

function AttractionPhotoGallery({
  attractionId,
  name,
}: {
  attractionId?: string
  name: string
}) {
  const photos = localPhotosForAttraction(attractionId)
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  if (photos.length === 0) {
    return (
      <section
        aria-label={`${name} photos`}
        className="result-photo-gallery result-photo-gallery-empty"
      >
        <p>Attraction imagery is not available yet.</p>
      </section>
    )
  }

  const selectedPhoto = photos[selectedPhotoIndex]
  const hasMultiplePhotos = photos.length > 1
  const selectPreviousPhoto = () => {
    setSelectedPhotoIndex((current) =>
      current === 0 ? photos.length - 1 : current - 1,
    )
  }
  const selectNextPhoto = () => {
    setSelectedPhotoIndex((current) => (current + 1) % photos.length)
  }

  return (
    <section aria-label={`${name} photos`} className="result-photo-gallery">
      <div className="result-photo-main">
        <img alt={selectedPhoto.alt} decoding="async" src={selectedPhoto.src} />
        <div className="result-photo-credit">
          <LocalPhotoAttribution photo={selectedPhoto} />
        </div>
        {hasMultiplePhotos ? (
          <>
            <button
              aria-label="Show previous photo"
              className="result-photo-control result-photo-previous"
              onClick={selectPreviousPhoto}
              type="button"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              aria-label="Show next photo"
              className="result-photo-control result-photo-next"
              onClick={selectNextPhoto}
              type="button"
            >
              <span aria-hidden="true">→</span>
            </button>
          </>
        ) : null}
        {hasMultiplePhotos ? (
          <span className="result-photo-count">
            {selectedPhotoIndex + 1} / {photos.length}
          </span>
        ) : null}
      </div>
      {hasMultiplePhotos ? (
        <div aria-label="Photo gallery" className="result-photo-thumbnails">
          {photos.map((photo, index) => (
            <button
              aria-label={`Show photo ${index + 1}`}
              aria-pressed={index === selectedPhotoIndex}
              className={
                index === selectedPhotoIndex
                  ? 'result-photo-thumbnail selected'
                  : 'result-photo-thumbnail'
              }
              key={photo.src}
              onClick={() => setSelectedPhotoIndex(index)}
              type="button"
            >
              <img alt="" loading="lazy" src={photo.src} />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function AttractionEvidenceDetails({
  attraction,
  places,
  priority,
  stayStartDate,
}: {
  attraction?: RomeAttraction
  places: RomePlace[]
  priority?: RomeBookingPriority
  stayStartDate: string
}) {
  const name = attractionName(attraction, places, priority)
  const attractionId =
    attraction?.id ?? priority?.attractionId ?? places[0]?.attractionId
  const availability = attraction
    ? availabilityCopy(attraction.availabilityStatus)
    : null
  const offering = attraction ? offeringTypeCopy(attraction.offeringType) : null
  const price = attraction ? formatPrice(attraction) : null
  const deadline = priority
    ? bookingGuidance(priority, stayStartDate)
    : undefined

  return (
    <div className="result-card-body result-details-body">
      <div className="result-details-layout">
        <aside className="result-details-media" aria-label={`${name} photos`}>
          <AttractionPhotoGallery
            attractionId={attractionId}
            key={attractionId ?? 'unknown-attraction'}
            name={name}
          />
        </aside>

        <div className="result-details-content">
          <section
            className="result-decision-overview"
            aria-label="Booking decision"
          >
            <div className="result-evidence-heading">
              <h3>Booking decision</h3>
              <span className="official-source-badge">Official source</span>
            </div>
            {priority ? (
              <>
                <div className="result-booking-deadline">
                  <small>Recommended booking action</small>
                  <strong>{deadline?.summary}</strong>
                  <p>{deadline?.note}</p>
                </div>
                <a
                  className="official-booking-button"
                  href={priority.officialEvidence.bookingUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open official booking
                  <span aria-hidden="true">↗</span>
                </a>
              </>
            ) : (
              <p className="result-provider-fallback">
                Booking priority is temporarily unavailable. No urgency is
                inferred from third-party ticket data.
              </p>
            )}
          </section>

          <section
            className="result-third-party-options"
            aria-label="Third-party booking options"
          >
            <h3>Third-party booking options</h3>
            {attraction && availability ? (
              <article className="result-third-party-option">
                <div className="result-third-party-option-heading">
                  <div>
                    <small>{attraction.source.provider}</small>
                    <strong>{price ?? 'Price coming soon'}</strong>
                  </div>
                  <span>{attraction.source.environment}</span>
                </div>
                <dl className="result-third-party-option-summary">
                  <div>
                    <dt>Option</dt>
                    <dd>{offering?.label}</dd>
                  </div>
                  <div>
                    <dt>Provider schedule</dt>
                    <dd>{availability.title}</dd>
                  </div>
                </dl>
                <div className="result-third-party-option-actions">
                  {attraction.source.referenceUrl ? (
                    <a
                      href={attraction.source.referenceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open third-party option
                      <span aria-hidden="true">↗</span>
                    </a>
                  ) : null}
                  <p>
                    Sandbox evidence, not live availability. Retrieved{' '}
                    {formatRetrievedAt(attraction.source.retrievedAt)} UTC.
                  </p>
                </div>
              </article>
            ) : (
              <p className="result-third-party-empty">
                Third-party options are coming soon. We are still connecting
                verified ticket providers for this attraction.
              </p>
            )}
          </section>

          <section
            className="result-supporting-evidence"
            aria-label="Supporting evidence"
          >
            <details className="result-evidence-disclosure">
              <summary>
                <span>Supporting evidence</span>
                <small>Official sources and verified locations</small>
              </summary>
              <div className="result-evidence-disclosure-body">
                <section
                  className="result-evidence-section"
                  aria-label="Official evidence"
                >
                  <h4>Official evidence</h4>
                  {priority ? (
                    <>
                      <p className="official-factual-basis">
                        {priority.officialEvidence.factualBasis}
                      </p>
                      <p className="result-source">
                        Official operator evidence
                        {' · '}Checked {priority.officialEvidence.checkedOn}
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
                      Official booking evidence is temporarily unavailable.
                    </p>
                  )}
                </section>

                <section
                  className="result-evidence-section result-location-evidence"
                  aria-label="Locations and map links"
                >
                  <h4>Locations and map links</h4>
                  {places.length > 0 ? (
                    <>
                      {places.length > 1 ? (
                        <p className="result-group-summary">
                          This attraction group contains {places.length}{' '}
                          separately verified locations.
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
                                </dd>
                              </div>
                            </dl>
                            <p className="result-source">
                              Retrieved {formatRetrievedAt(place.retrievedAt)}{' '}
                              UTC
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
                      Verified location evidence is temporarily unavailable.
                    </p>
                  )}
                </section>
              </div>
            </details>
          </section>
        </div>
      </div>
    </div>
  )
}

function AttractionDetailsDialog({
  attraction,
  onClose,
  places,
  priority,
  stayStartDate,
}: {
  attraction?: RomeAttraction
  onClose: () => void
  places: RomePlace[]
  priority?: RomeBookingPriority
  stayStartDate: string
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
          stayStartDate={stayStartDate}
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
  const [favouriteAttractionIds, setFavouriteAttractionIds] = useState(
    loadFavouriteAttractionIds,
  )
  const [saveFeedback, setSaveFeedback] = useState('')
  const [searchParams] = useSearchParams()
  const city = searchParams.get('city')
  const startDate = searchParams.get('stayStartDate')
  const endDate = searchParams.get('stayEndDate')
  const dateMode: TripDateMode =
    searchParams.get('dateMode') === 'flexible' ? 'flexible' : 'exact'
  const travelMonth = searchParams.get('travelMonth')
  const tripLengthDays = positiveInteger(searchParams.get('tripLengthDays'))
  const lengthFlexDays = nonNegativeInteger(searchParams.get('lengthFlexDays'))
  const flexibleDates = flexibleDateCopy(
    travelMonth,
    tripLengthDays,
    lengthFlexDays,
  )
  const hasValidQuery = city === 'rome' && Boolean(startDate && endDate)
  const resultSetKey = `${startDate ?? ''}:${endDate ?? ''}`
  const [pagination, setPagination] = useState({
    resultSetKey,
    visibleAttractionCount: INITIAL_VISIBLE_ATTRACTION_COUNT,
  })

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
      city: 'rome',
      dateMode,
      stayStartDate: startDate!,
      stayEndDate: endDate!,
      travelMonth:
        dateMode === 'flexible' ? (travelMonth ?? undefined) : undefined,
      tripLengthDays: dateMode === 'flexible' ? tripLengthDays : undefined,
      lengthFlexDays: dateMode === 'flexible' ? lengthFlexDays : undefined,
      attractionIds: favouriteAttractionIds,
    })
    setSaveFeedback(
      trip
        ? `Trip saved in this browser with ${trip.attractionIds.length} attraction${trip.attractionIds.length === 1 ? '' : 's'}.`
        : 'This browser could not save the trip.',
    )
  }

  const priorityQuery = useQuery({
    queryKey: ['rome-booking-priorities', startDate, endDate],
    queryFn: () => fetchRomeBookingPriorities(startDate!, endDate!),
    enabled: hasValidQuery,
    retry: false,
  })
  const [explanationRequested, setExplanationRequested] = useState(false)
  const explanationQuery = useQuery({
    queryKey: ['rome-booking-explanation', startDate, endDate],
    queryFn: () => fetchRomeBookingExplanation(startDate!, endDate!),
    enabled: hasValidQuery && explanationRequested,
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
  const mapPlaces = useMemo(
    () => mergeRomeMapPlaces(placeQuery.data?.attractions ?? []),
    [placeQuery.data?.attractions],
  )

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
  const providerAttractionIds = [
    ...priorities.map((priority) => priority.attractionId),
    ...attractions.map((attraction) => attraction.id),
    ...places.map((place) => place.attractionId),
  ].filter((id, index, ids) => ids.indexOf(id) === index)
  const allQueriesSettled =
    !priorityQuery.isPending && !ticketQuery.isPending && !placeQuery.isPending
  const orderedAttractionIds =
    providerAttractionIds.length > 0
      ? providerAttractionIds
      : allQueriesSettled
        ? mapPlaces
            .map((place) => place.attractionId)
            .filter((id, index, ids) => ids.indexOf(id) === index)
        : []
  const visibleAttractionIds = orderedAttractionIds.slice(
    0,
    pagination.resultSetKey === resultSetKey
      ? pagination.visibleAttractionCount
      : INITIAL_VISIBLE_ATTRACTION_COUNT,
  )
  const hasMoreAttractions =
    visibleAttractionIds.length < orderedAttractionIds.length
  const hasBookingOrder = orderedAttractionIds.length > 0
  const isLoading =
    !hasBookingOrder &&
    (priorityQuery.isPending || ticketQuery.isPending || placeQuery.isPending)

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
                  {dateMode === 'flexible' ? 'Flexible window: ' : ''}
                </span>
                <strong>{startDate}</strong> to <strong>{endDate}</strong>
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
            <section className="booking-explanation" aria-live="polite">
              <div>
                <p className="eyebrow">Booking explanation</p>
                <h2>Why is this the order?</h2>
                <p>
                  Read a short explanation based only on the checked official
                  facts already used to build this plan.
                </p>
              </div>
              {!explanationRequested ? (
                <button
                  className="button button-secondary"
                  onClick={() => setExplanationRequested(true)}
                  type="button"
                >
                  Explain this order
                </button>
              ) : null}
              {explanationQuery.isPending ? (
                <p className="booking-explanation-status" role="status">
                  Preparing an explanation from verified booking facts...
                </p>
              ) : null}
              {explanationQuery.isError ? (
                <div className="booking-explanation-error" role="alert">
                  <p>{explanationQuery.error.message}</p>
                  <button
                    className="button button-secondary"
                    onClick={() => explanationQuery.refetch()}
                    type="button"
                  >
                    Retry explanation
                  </button>
                </div>
              ) : null}
              {explanationQuery.data ? (
                <div className="booking-explanation-answer">
                  <span>{explanationModeCopy(explanationQuery.data.mode)}</span>
                  <p>{explanationQuery.data.summary}</p>
                  <small>{explanationQuery.data.boundaryNotice}</small>
                </div>
              ) : null}
            </section>
            {saveFeedback ? (
              <p className="result-save-feedback" role="status">
                {saveFeedback}
              </p>
            ) : null}
            {visibleAttractionIds.map((attractionId) => (
              <AttractionEvidenceCard
                attraction={attractions.find(
                  (attraction) => attraction.id === attractionId,
                )}
                isFavourite={favouriteAttractionIds.includes(attractionId)}
                isSelected={selectedAttractionId === attractionId}
                key={attractionId}
                onOpen={() => setDetailAttractionId(attractionId)}
                onSelect={() => setSelectedAttractionId(attractionId)}
                onToggleFavourite={() => toggleFavourite(attractionId)}
                places={mapPlaces.filter(
                  (place) => place.attractionId === attractionId,
                )}
                priority={priorities.find(
                  (priority) => priority.attractionId === attractionId,
                )}
                stayStartDate={startDate!}
              />
            ))}
            {hasMoreAttractions ? (
              <div className="result-list-load-more">
                <button
                  className="button button-secondary"
                  onClick={() =>
                    setPagination((current) => ({
                      resultSetKey,
                      visibleAttractionCount:
                        (current.resultSetKey === resultSetKey
                          ? current.visibleAttractionCount
                          : INITIAL_VISIBLE_ATTRACTION_COUNT) +
                        LOAD_MORE_ATTRACTION_COUNT,
                    }))
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
          attraction={attractions.find(
            (attraction) => attraction.id === detailAttractionId,
          )}
          key={detailAttractionId}
          onClose={() => setDetailAttractionId(undefined)}
          places={mapPlaces.filter(
            (place) => place.attractionId === detailAttractionId,
          )}
          priority={priorities.find(
            (priority) => priority.attractionId === detailAttractionId,
          )}
          stayStartDate={startDate!}
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
