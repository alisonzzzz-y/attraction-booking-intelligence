import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildSavedTripUrl,
  loadFavouriteAttractionIds,
  loadSavedTrip,
  loadResultsAttractionIds,
  saveFavouriteAttractionIds,
  saveTrip,
} from '../features/trips/localTripStorage'

afterEach(() => {
  vi.restoreAllMocks()
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
      '/results?city=rome&stayStartDate=2026-09-01&stayEndDate=2026-09-06&resume=saved&dateMode=flexible&travelMonth=2026-09&tripLengthDays=5&lengthFlexDays=1',
    )
  })

  it('restores the saved snapshot without replacing later global favourites', () => {
    const trip = saveTrip({
      city: 'rome',
      dateMode: 'exact',
      stayStartDate: '2026-10-01',
      stayEndDate: '2026-10-03',
      attractionIds: ['pantheon'],
    })!
    saveFavouriteAttractionIds(['borghese-gallery'])
    const params = new URLSearchParams(buildSavedTripUrl(trip).split('?')[1])
    expect(loadResultsAttractionIds(params)).toEqual(['pantheon'])
    expect(loadFavouriteAttractionIds()).toEqual(['borghese-gallery'])
    params.set('stayStartDate', '2026-10-02')
    expect(loadResultsAttractionIds(params)).toEqual(['borghese-gallery'])
  })

  it('handles a browser that throws when localStorage is accessed', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Blocked', 'SecurityError')
    })
    expect(loadSavedTrip()).toBeNull()
    expect(loadFavouriteAttractionIds()).toEqual([])
    expect(() => saveFavouriteAttractionIds(['pantheon'])).not.toThrow()
    expect(
      saveTrip({
        city: 'rome',
        dateMode: 'exact',
        stayStartDate: '2026-10-01',
        stayEndDate: '2026-10-03',
        attractionIds: [],
      }),
    ).toBeNull()
  })

  it('rejects corrupt saved dates and incomplete flexible plans', () => {
    for (const extra of [
      { stayStartDate: '2026-02-30' },
      { dateMode: 'flexible', travelMonth: '2026-99' },
    ]) {
      window.localStorage.setItem(
        'abi.saved-trip.v1',
        JSON.stringify({
          version: 1,
          city: 'rome',
          dateMode: 'exact',
          stayStartDate: '2026-10-01',
          stayEndDate: '2026-10-03',
          attractionIds: [],
          savedAt: '2026-09-01T00:00:00Z',
          ...extra,
        }),
      )
      expect(loadSavedTrip()).toBeNull()
    }
  })
})
