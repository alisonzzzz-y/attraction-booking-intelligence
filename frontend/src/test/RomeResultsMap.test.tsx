import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RomeResultsMap } from '../features/attractions/RomeResultsMap'

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
  it('preserves a list-first fallback when the browser key is unavailable', () => {
    render(
      <RomeResultsMap
        apiKey=""
        places={[pantheon]}
        selectedAttractionId="pantheon"
      />,
    )

    expect(screen.getByRole('heading', { name: 'Map' })).toBeInTheDocument()
    expect(
      screen.getByText('Map view is not configured here.'),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'The verified location facts remain available in the list.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/Focused location:/)).toHaveTextContent(
      'Focused location: Pantheon',
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

    expect(screen.getByText(/Focused group:/)).toHaveTextContent(
      'Focused group: Roman Forum, Palatine Hill',
    )
  })
})
