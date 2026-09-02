import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RomeResultsMap } from '../features/attractions/RomeResultsMap'

const { createdMarkers, createdPins, mapConstructor, panTo } = vi.hoisted(
  () => ({
    createdMarkers: [] as Array<{ zIndex?: number | null }>,
    createdPins: [] as Array<{ scale?: number | null }>,
    mapConstructor: vi.fn(),
    panTo: vi.fn(),
  }),
)

vi.mock('../shared/googleMaps/loadGoogleMaps', () => ({
  loadGoogleMaps: vi.fn(() =>
    Promise.resolve({
      maps: {
        Map: class {
          panTo = panTo

          constructor(element: HTMLElement, options: unknown) {
            mapConstructor(element, options)
          }
        },
      },
      marker: {
        PinElement: class {
          scale?: number | null

          constructor(options: { scale?: number | null }) {
            this.scale = options.scale
            createdPins.push(this)
          }
        },
        AdvancedMarkerElement: class {
          map: unknown
          zIndex?: number | null

          constructor(options: { map: unknown }) {
            this.map = options.map
            createdMarkers.push(this)
          }
        },
      },
    }),
  ),
}))

const pantheon = {
  attractionId: 'pantheon',
  componentId: 'pantheon',
  placeId: 'ChIJqUCGZ09gLxMRLM42IPpl0co',
  name: 'Pantheon',
  formattedAddress: 'Piazza della Rotonda, 00186 Roma RM, Italy',
  location: { latitude: 41.898_610_8, longitude: 12.476_872_9 },
  googleMapsUri: 'https://maps.google.com/?cid=example',
  businessStatus: 'OPERATIONAL',
  retrievedAt: '2026-08-19T08:01:00Z',
}

describe('RomeResultsMap', () => {
  beforeEach(() => {
    cleanup()
    window.gm_authFailure = undefined
    mapConstructor.mockClear()
    panTo.mockClear()
    createdMarkers.length = 0
    createdPins.length = 0
  })

  it('preserves a list-first fallback when the browser key is unavailable', () => {
    render(
      <RomeResultsMap
        apiKey=""
        places={[pantheon]}
        selectedAttractionId="pantheon"
      />,
    )

    expect(
      screen.queryByRole('heading', { name: 'Map' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Map view is not configured here.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'The verified location facts remain available in the list.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Selected map location')).toHaveTextContent(
      'Pantheon',
    )
  })

  it('describes all selected locations in a composite attraction group', () => {
    const romanForum = {
      ...pantheon,
      attractionId: 'colosseum-archaeological-park',
      componentId: 'roman-forum',
      placeId: 'ChIJ782pg7NhLxMR5n3swAdAkfo',
      name: 'Roman Forum',
    }
    const palatineHill = {
      ...pantheon,
      attractionId: 'colosseum-archaeological-park',
      componentId: 'palatine-hill',
      placeId: 'ChIJowJff7VhLxMRLmHQKoSniFE',
      name: 'Palatine Hill',
    }

    render(
      <RomeResultsMap
        apiKey=""
        places={[romanForum, palatineHill]}
        selectedAttractionId="colosseum-archaeological-park"
      />,
    )

    expect(screen.getByText('Roman Forum · Palatine Hill')).toBeInTheDocument()
  })

  it('smoothly pans to a selected attraction without changing the overview zoom', async () => {
    const places = [pantheon]
    const { rerender } = render(
      <RomeResultsMap apiKey="browser-key" places={places} />,
    )

    await waitFor(() => expect(mapConstructor).toHaveBeenCalledOnce())
    expect(mapConstructor.mock.calls[0]?.[1]).toMatchObject({ zoom: 13 })

    rerender(
      <RomeResultsMap
        apiKey="browser-key"
        places={places}
        selectedAttractionId="pantheon"
      />,
    )

    await waitFor(() =>
      expect(panTo).toHaveBeenCalledWith({
        lat: pantheon.location.latitude,
        lng: pantheon.location.longitude,
      }),
    )
    expect(mapConstructor).toHaveBeenCalledOnce()
  })

  it('enlarges only the selected attraction pin', async () => {
    const borgheseGallery = {
      ...pantheon,
      attractionId: 'borghese-gallery',
      componentId: 'borghese-gallery',
      placeId: 'ChIJdZbTjKZhLxMRc2lBskMArXA',
      name: 'Borghese Gallery',
      location: { latitude: 41.914_217, longitude: 12.492_143 },
    }
    const places = [pantheon, borgheseGallery]
    const { rerender } = render(
      <RomeResultsMap apiKey="browser-key" places={places} />,
    )

    await waitFor(() => expect(createdPins).toHaveLength(2))
    expect(createdPins.map((pin) => pin.scale)).toEqual([0.8, 0.8])

    rerender(
      <RomeResultsMap
        apiKey="browser-key"
        places={places}
        selectedAttractionId="pantheon"
      />,
    )

    await waitFor(() => expect(createdPins[0]?.scale).toBe(1.3))
    expect(createdPins[1]?.scale).toBe(0.8)
    expect(createdMarkers[0]?.zIndex).toBe(10)
    expect(createdMarkers[1]?.zIndex).toBe(1)

    rerender(
      <RomeResultsMap
        apiKey="browser-key"
        places={places}
        selectedAttractionId="borghese-gallery"
      />,
    )

    await waitFor(() => expect(createdPins[1]?.scale).toBe(1.3))
    expect(createdPins[0]?.scale).toBe(0.8)
  })

  it('identifies a browser-key rejection without exposing the key', async () => {
    render(<RomeResultsMap apiKey="browser-key" places={[pantheon]} />)

    await waitFor(() => expect(mapConstructor).toHaveBeenCalledOnce())
    window.gm_authFailure?.()

    await waitFor(() =>
      expect(screen.getByText('The map could not be loaded.')).toBeInTheDocument(),
    )
    expect(screen.getByText(`Google Maps rejected ${window.location.origin}.`)).toBeInTheDocument()
    expect(screen.queryByText('browser-key')).not.toBeInTheDocument()
  })
})
