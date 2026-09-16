import type { RomeAttraction } from '../../shared/api/romeAttractions'
import type { RomeBookingPriority } from '../../shared/api/romeBookingPriorities'
import type { RomePlace } from '../../shared/api/romePlaces'

export function formatPrice(attraction: RomeAttraction) {
  const price = attraction.prices[0]
  if (!price) return null

  const amount = new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency: price.currency,
  }).format(price.amount)

  return `${price.kind === 'FROM' ? 'From ' : ''}${amount}`
}

export function formatRetrievedAt(value: string) {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(value))
}

export function flexibleDateCopy(
  travelMonth: string | undefined,
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

export function priorityCopy(priority: RomeBookingPriority['priority']) {
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

export function officialPolicyCopy(
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
      return 'Ticket required; lead time unverified'
  }
}

export function availabilityCopy(status: RomeAttraction['availabilityStatus']) {
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

export function offeringTypeCopy(type: RomeAttraction['offeringType']) {
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

export function attractionName(
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
