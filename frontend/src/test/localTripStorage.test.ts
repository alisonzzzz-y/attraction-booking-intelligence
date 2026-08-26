import { afterEach, describe, expect, it } from 'vitest'
import {
  buildSavedTripUrl,
  loadFavouriteAttractionIds,
  loadSavedTrip,
  saveFavouriteAttractionIds,
  saveTrip,
} from '../features/trips/localTripStorage'

afterEach(() => {
  window.localStorage.clear()
})

describe('local trip storage', () => {
  it('keeps unique favourite attraction identifiers', () => {
    saveFavouriteAttractionIds(['pantheon', 'pantheon', 'borghese-gallery'])

    expect(loadFavouriteAttractionIds()).toEqual([
      'pantheon',
      'borghese-gallery',
    ])
  })

  it('rejects saved data from an unknown schema version', () => {
    window.localStorage.setItem(
      'abi.saved-trip.v1',
      JSON.stringify({ version: 2, city: 'rome' }),
    )

    expect(loadSavedTrip()).toBeNull()
  })

  it('restores a flexible trip with a shareable results URL', () => {
    const trip = saveTrip({
      city: 'rome',
      dateMode: 'flexible',
      stayStartDate: '2026-09-01',
      stayEndDate: '2026-09-06',
      travelMonth: '2026-09',
      tripLengthDays: 5,
      lengthFlexDays: 1,
      attractionIds: ['pantheon'],
    })

    expect(trip).not.toBeNull()
    expect(loadSavedTrip()).toMatchObject({
      version: 1,
      city: 'rome',
      dateMode: 'flexible',
      travelMonth: '2026-09',
      tripLengthDays: 5,
      lengthFlexDays: 1,
      attractionIds: ['pantheon'],
    })
    expect(buildSavedTripUrl(trip!)).toBe(
      '/results?city=rome&stayStartDate=2026-09-01&stayEndDate=2026-09-06&dateMode=flexible&travelMonth=2026-09&tripLengthDays=5&lengthFlexDays=1',
    )
  })
})
