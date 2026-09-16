import type { RomeAttraction } from '../../shared/api/romeAttractions'
import type { RomeBookingPriority } from '../../shared/api/romeBookingPriorities'
import type { RomePlace } from '../../shared/api/romePlaces'
import { AttractionPhotoGallery } from './AttractionPhotoGallery'
import { bookingGuidance, formatPlanningDate } from './bookingGuidance'
import { romeAttractionOverview } from './romeAttractionOverviews'
import {
  attractionName,
  availabilityCopy,
  formatPrice,
  formatRetrievedAt,
  offeringTypeCopy,
} from './resultPresentation'

export function AttractionEvidenceDetails({
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
  const localOverview = romeAttractionOverview(attractionId)
  const overview =
    priority?.officialEvidence.details?.overview ?? localOverview?.text
  const overviewSource = priority?.officialEvidence.details?.overview
    ? priority.officialEvidence.sourceUrl
    : localOverview?.sourceUrl
  const guidance = priority
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
          {overview ? (
            <section
              className="result-attraction-overview"
              aria-label="About this attraction"
            >
              <h3>About this attraction</h3>
              <p>{overview}</p>
              <a href={overviewSource} target="_blank" rel="noreferrer">
                Official source
              </a>
            </section>
          ) : null}

          <section
            className="result-decision-overview"
            aria-label="Booking decision"
          >
            <div className="result-evidence-heading">
              <h3>Booking decision</h3>
              <span className="official-source-badge">
                {guidance?.targetDate
                  ? 'Planning estimate'
                  : 'Official guidance'}
              </span>
            </div>
            {priority ? (
              <>
                <div className="result-booking-deadline">
                  <small>
                    {guidance?.label ?? 'Recommended booking action'}
                  </small>
                  <strong>{guidance?.summary}</strong>
                  {guidance?.targetDate ? (
                    <p className="result-booking-target">
                      Planning target:{' '}
                      <strong>{formatPlanningDate(guidance.targetDate)}</strong>
                    </p>
                  ) : null}
                  {guidance?.release ? (
                    <p>
                      {guidance.release.summary}
                      {' · '}
                      <a
                        href={guidance.release.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Release policy
                      </a>
                      {' · '}Checked {guidance.release.checkedOn}
                    </p>
                  ) : null}
                  <p>{guidance?.note}</p>
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
