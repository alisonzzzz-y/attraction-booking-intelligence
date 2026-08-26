export type TripDateMode = 'exact' | 'flexible'

export type SavedTrip = {
  version: 1
  city: 'rome'
  dateMode: TripDateMode
  stayStartDate: string
  stayEndDate: string
  travelMonth?: string
  tripLengthDays?: number
  lengthFlexDays?: number
  attractionIds: string[]
  savedAt: string
}

const FAVOURITES_KEY = 'abi.favourite-attractions.v1'
const SAVED_TRIP_KEY = 'abi.saved-trip.v1'

function storageAvailable() {
  return (
    typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  )
}

function isDateMode(value: unknown): value is TripDateMode {
  return value === 'exact' || value === 'flexible'
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return [
    ...new Set(
      value.filter(
        (item): item is string => typeof item === 'string' && item.length > 0,
      ),
    ),
  ]
}

function optionalNumber(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : undefined
}

export function loadFavouriteAttractionIds(): string[] {
  if (!storageAvailable()) {
    return []
  }

  try {
    return uniqueStrings(
      JSON.parse(window.localStorage.getItem(FAVOURITES_KEY) ?? '[]'),
    )
  } catch {
    return []
  }
}

export function saveFavouriteAttractionIds(attractionIds: string[]) {
  if (!storageAvailable()) {
    return
  }

  try {
    window.localStorage.setItem(
      FAVOURITES_KEY,
      JSON.stringify(uniqueStrings(attractionIds)),
    )
  } catch {
    // The page remains usable when browser storage is blocked or full.
  }
}

export function loadSavedTrip(): SavedTrip | null {
  if (!storageAvailable()) {
    return null
  }

  try {
    const value: unknown = JSON.parse(
      window.localStorage.getItem(SAVED_TRIP_KEY) ?? 'null',
    )
    if (!value || typeof value !== 'object') {
      return null
    }

    const candidate = value as Record<string, unknown>
    if (
      candidate.version !== 1 ||
      candidate.city !== 'rome' ||
      !isDateMode(candidate.dateMode) ||
      typeof candidate.stayStartDate !== 'string' ||
      typeof candidate.stayEndDate !== 'string' ||
      typeof candidate.savedAt !== 'string'
    ) {
      return null
    }

    const travelMonth =
      typeof candidate.travelMonth === 'string'
        ? candidate.travelMonth
        : undefined

    return {
      version: 1,
      city: 'rome',
      dateMode: candidate.dateMode,
      stayStartDate: candidate.stayStartDate,
      stayEndDate: candidate.stayEndDate,
      travelMonth,
      tripLengthDays: optionalNumber(candidate.tripLengthDays),
      lengthFlexDays: optionalNumber(candidate.lengthFlexDays),
      attractionIds: uniqueStrings(candidate.attractionIds),
      savedAt: candidate.savedAt,
    }
  } catch {
    return null
  }
}

export function saveTrip(
  input: Omit<SavedTrip, 'version' | 'savedAt'>,
): SavedTrip | null {
  if (!storageAvailable()) {
    return null
  }

  const trip: SavedTrip = {
    ...input,
    version: 1,
    attractionIds: uniqueStrings(input.attractionIds),
    savedAt: new Date().toISOString(),
  }

  try {
    window.localStorage.setItem(SAVED_TRIP_KEY, JSON.stringify(trip))
    return trip
  } catch {
    return null
  }
}

export function buildSavedTripUrl(trip: SavedTrip) {
  const params = new URLSearchParams({
    city: trip.city,
    stayStartDate: trip.stayStartDate,
    stayEndDate: trip.stayEndDate,
  })

  if (trip.dateMode === 'flexible') {
    params.set('dateMode', 'flexible')
    if (trip.travelMonth) {
      params.set('travelMonth', trip.travelMonth)
    }
    if (trip.tripLengthDays !== undefined) {
      params.set('tripLengthDays', String(trip.tripLengthDays))
    }
    if (trip.lengthFlexDays !== undefined) {
      params.set('lengthFlexDays', String(trip.lengthFlexDays))
    }
  }

  return `/results?${params.toString()}`
}
