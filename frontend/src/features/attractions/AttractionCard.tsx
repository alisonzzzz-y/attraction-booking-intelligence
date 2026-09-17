import type { KeyboardEvent } from 'react'
import type { RomeAttraction } from '../../shared/api/romeAttractions'
import type { RomeBookingPriority } from '../../shared/api/romeBookingPriorities'
import type { RomePlace } from '../../shared/api/romePlaces'
import { bookingGuidance } from './bookingGuidance'
import { LocalPhotoAttribution } from './AttractionPhotoGallery'
import { localPhotosForAttraction } from './romeLocalPhotos'
import {
  attractionName,
  formatPrice,
  officialPolicyCopy,
  priorityCopy,
} from './resultPresentation'

export function AttractionCard({
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
  const priorityLabel = priority
    ? priorityCopy(priority.priority)
    : 'Priority unavailable'
  const guidance = priority
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
            <small>Booking target</small>
            <strong>{guidance?.summary ?? 'Check official source'}</strong>
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
            <strong>{price ?? 'Coming soon'}</strong>
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
