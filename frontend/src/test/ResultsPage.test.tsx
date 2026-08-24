import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ResultsPage } from '../app/ResultsPage'

const resultsRoute =
  '/results?city=rome&stayStartDate=2026-09-10&stayEndDate=2026-09-12'

function priority(
  attractionId: string,
  attractionName: string,
  bookingPriority: 'BOOK_FIRST' | 'BOOK_SOON' | 'CAN_WAIT' | 'UNKNOWN',
  timing:
    | 'AS_SOON_AS_VISIT_DATE_IS_FIXED'
    | 'BEFORE_FINALISING_DAILY_PLAN'
    | 'AFTER_HIGHER_PRIORITY_TICKETS'
    | 'CHECK_OFFICIAL_SOURCE',
  policy:
    | 'TIMED_RESERVATION_REQUIRED'
    | 'ADVANCE_BOOKING_RECOMMENDED'
    | 'NO_ADVANCE_RESERVATION_REQUIRED'
    | 'FREE_GENERAL_ENTRY'
    | 'OPTIONAL_PAID_AREA'
    | 'TICKET_REQUIRED_TIMING_UNKNOWN',
) {
  return {
    attractionId,
    attractionName,
    priority: bookingPriority,
    confidence: bookingPriority === 'UNKNOWN' ? 'LOW' : 'HIGH',
    timing,
    action:
      bookingPriority === 'BOOK_FIRST'
        ? 'Handle this ticket before flexible attractions.'
        : 'Keep this after higher-priority tickets.',
    explanation:
      bookingPriority === 'UNKNOWN'
        ? 'The verified source does not support an exact booking lead time.'
        : 'This recommendation follows the verified official reservation policy.',
    officialEvidence: {
      sourceType: 'OFFICIAL_OPERATOR',
      policy,
      factualBasis: `Verified official booking rule for ${attractionName}.`,
      sourceUrl: `https://official.example/${attractionId}`,
      checkedOn: '2026-08-21',
    },
    ruleVersion: 'rome-official-policy-v1',
    calculatedAt: '2026-08-22T08:00:00Z',
  }
}

const priorityResponse = {
  city: 'Rome',
  stayStartDate: '2026-09-10',
  stayEndDate: '2026-09-12',
  priorities: [
    priority(
      'colosseum-archaeological-park',
      'Colosseum, Roman Forum and Palatine Hill',
      'BOOK_FIRST',
      'AS_SOON_AS_VISIT_DATE_IS_FIXED',
      'TIMED_RESERVATION_REQUIRED',
    ),
    priority(
      'borghese-gallery',
      'Borghese Gallery',
      'BOOK_FIRST',
      'AS_SOON_AS_VISIT_DATE_IS_FIXED',
      'TIMED_RESERVATION_REQUIRED',
    ),
    priority(
      'domus-aurea',
      'Domus Aurea',
      'BOOK_FIRST',
      'AS_SOON_AS_VISIT_DATE_IS_FIXED',
      'TIMED_RESERVATION_REQUIRED',
    ),
    priority(
      'capitoline-museums',
      'Capitoline Museums',
      'BOOK_SOON',
      'BEFORE_FINALISING_DAILY_PLAN',
      'ADVANCE_BOOKING_RECOMMENDED',
    ),
    priority(
      'st-peters-basilica',
      "St. Peter's Basilica",
      'CAN_WAIT',
      'AFTER_HIGHER_PRIORITY_TICKETS',
      'FREE_GENERAL_ENTRY',
    ),
    priority(
      'baths-of-caracalla',
      'Baths of Caracalla',
      'CAN_WAIT',
      'AFTER_HIGHER_PRIORITY_TICKETS',
      'NO_ADVANCE_RESERVATION_REQUIRED',
    ),
    priority(
      'trevi-fountain',
      'Trevi Fountain',
      'CAN_WAIT',
      'AFTER_HIGHER_PRIORITY_TICKETS',
      'OPTIONAL_PAID_AREA',
    ),
    priority(
      'vatican-museums-sistine-chapel',
      'Vatican Museums and Sistine Chapel',
      'UNKNOWN',
      'CHECK_OFFICIAL_SOURCE',
      'TICKET_REQUIRED_TIMING_UNKNOWN',
    ),
    priority(
      'pantheon',
      'Pantheon',
      'UNKNOWN',
      'CHECK_OFFICIAL_SOURCE',
      'TICKET_REQUIRED_TIMING_UNKNOWN',
    ),
    priority(
      'castel-sant-angelo',
      "Castel Sant'Angelo",
      'UNKNOWN',
      'CHECK_OFFICIAL_SOURCE',
      'TICKET_REQUIRED_TIMING_UNKNOWN',
    ),
  ],
}

const ticketResponse = {
  city: 'Rome',
  provider: 'viator',
  environment: 'SANDBOX',
  partialFailure: false,
  attractions: [
    {
      id: 'pantheon',
      name: 'Pantheon',
      offeringType: 'TICKET_PRODUCT',
      availabilityStatus: 'SCHEDULED',
      reservationRequirement: 'UNKNOWN',
      prices: [{ amount: 17, currency: 'EUR', kind: 'FROM' }],
      source: {
        provider: 'viator',
        environment: 'SANDBOX',
        retrievedAt: '2026-08-19T08:00:00Z',
        freshness: 'FRESH',
        referenceUrl: null,
      },
    },
    {
      id: 'borghese-gallery',
      name: 'Borghese Gallery',
      offeringType: 'TICKET_WITH_AUDIO_GUIDE',
      availabilityStatus: 'SCHEDULED',
      reservationRequirement: 'UNKNOWN',
      prices: [{ amount: 29, currency: 'EUR', kind: 'FROM' }],
      source: {
        provider: 'viator',
        environment: 'SANDBOX',
        retrievedAt: '2026-08-19T08:00:00Z',
        freshness: 'FRESH',
        referenceUrl: null,
      },
    },
    {
      id: 'colosseum-archaeological-park',
      name: 'Colosseum Archaeological Park',
      offeringType: 'GUIDED_TOUR',
      availabilityStatus: 'SCHEDULED',
      reservationRequirement: 'UNKNOWN',
      prices: [{ amount: 49, currency: 'EUR', kind: 'FROM' }],
      source: {
        provider: 'viator',
        environment: 'SANDBOX',
        retrievedAt: '2026-08-19T08:00:00Z',
        freshness: 'FRESH',
        referenceUrl: null,
      },
    },
    {
      id: 'vatican-museums-sistine-chapel',
      name: 'Vatican Museums and Sistine Chapel',
      offeringType: 'TICKET_PRODUCT',
      availabilityStatus: 'SCHEDULED',
      reservationRequirement: 'UNKNOWN',
      prices: [{ amount: 69, currency: 'EUR', kind: 'FROM' }],
      source: {
        provider: 'viator',
        environment: 'SANDBOX',
        retrievedAt: '2026-08-20T08:00:00Z',
        freshness: 'FRESH',
        referenceUrl: null,
      },
    },
    {
      id: 'baths-of-caracalla',
      name: 'Baths of Caracalla',
      offeringType: 'TICKET_WITH_AUDIO_GUIDE',
      availabilityStatus: 'SCHEDULED',
      reservationRequirement: 'UNKNOWN',
      prices: [{ amount: 15, currency: 'EUR', kind: 'FROM' }],
      source: {
        provider: 'viator',
        environment: 'SANDBOX',
        retrievedAt: '2026-08-21T08:00:00Z',
        freshness: 'FRESH',
        referenceUrl: null,
      },
    },
    {
      id: 'capitoline-museums',
      name: 'Capitoline Museums',
      offeringType: 'TICKET_PRODUCT',
      availabilityStatus: 'SCHEDULED',
      reservationRequirement: 'UNKNOWN',
      prices: [{ amount: 30, currency: 'EUR', kind: 'FROM' }],
      source: {
        provider: 'viator',
        environment: 'SANDBOX',
        retrievedAt: '2026-08-21T08:30:00Z',
        freshness: 'FRESH',
        referenceUrl: null,
      },
    },
  ],
  errors: [],
}

const placeResponse = {
  city: 'Rome',
  source: 'google-places',
  attractions: [
    {
      attractionId: 'pantheon',
      componentId: 'pantheon',
      placeId: 'ChIJqUCGZ09gLxMRLM42IPpl0co',
      name: 'Pantheon',
      formattedAddress: 'Piazza della Rotonda, 00186 Roma RM, Italy',
      location: { latitude: 41.898_610_8, longitude: 12.476_872_9 },
      googleMapsUri: 'https://maps.google.com/?cid=example',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-19T08:01:00Z',
    },
    {
      attractionId: 'borghese-gallery',
      componentId: 'borghese-gallery',
      placeId: 'ChIJq-bXVgRhLxMRv3vgOXaktBs',
      name: 'Galleria Borghese',
      formattedAddress: 'Piazzale Scipione Borghese, 5, 00197 Roma RM, Italy',
      location: { latitude: 41.914_231, longitude: 12.492_143 },
      googleMapsUri: 'https://maps.google.com/?cid=borghese-example',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-19T08:01:00Z',
    },
    {
      attractionId: 'colosseum-archaeological-park',
      componentId: 'colosseum',
      placeId: 'ChIJrRMgU7ZhLxMRxAOFkC7I8Sg',
      name: 'Colosseum',
      formattedAddress: 'Piazza del Colosseo, 1, 00184 Roma RM, Italy',
      location: { latitude: 41.890_21, longitude: 12.492_231 },
      googleMapsUri: 'https://maps.google.com/?cid=colosseum',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-19T08:01:00Z',
    },
    {
      attractionId: 'baths-of-caracalla',
      componentId: 'baths-of-caracalla',
      placeId: 'ChIJ1YU-M85hLxMR3Jhb6gZAK2o',
      name: 'Baths of Caracalla',
      formattedAddress: 'Viale delle Terme di Caracalla, 00153 Roma RM, Italy',
      location: { latitude: 41.879_038_2, longitude: 12.492_439_4 },
      googleMapsUri: 'https://maps.google.com/?cid=baths-of-caracalla',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-21T08:01:00Z',
    },
    {
      attractionId: 'vatican-museums-sistine-chapel',
      componentId: 'vatican-museums',
      placeId: 'ChIJKcGbg2NgLxMRthZkUqDs4M8',
      name: 'Vatican Museums',
      formattedAddress: '00120, Vatican City',
      location: { latitude: 41.906_487_8, longitude: 12.453_641_3 },
      googleMapsUri: 'https://maps.google.com/?cid=vatican-museums',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-20T08:01:00Z',
    },
    {
      attractionId: 'vatican-museums-sistine-chapel',
      componentId: 'sistine-chapel',
      placeId: 'ChIJ268jxWVgLxMRIj61f4fIFqs',
      name: 'Sistine Chapel',
      formattedAddress: '00120, Vatican City',
      location: { latitude: 41.902_946_8, longitude: 12.454_483_5 },
      googleMapsUri: 'https://maps.google.com/?cid=sistine-chapel',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-20T08:01:00Z',
    },
    {
      attractionId: 'colosseum-archaeological-park',
      componentId: 'roman-forum',
      placeId: 'ChIJ782pg7NhLxMR5n3swAdAkfo',
      name: 'Roman Forum',
      formattedAddress: 'Via della Salara Vecchia, 5/6, 00186 Roma RM, Italy',
      location: { latitude: 41.892_462, longitude: 12.485_325 },
      googleMapsUri: 'https://maps.google.com/?cid=roman-forum',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-19T08:01:00Z',
    },
    {
      attractionId: 'colosseum-archaeological-park',
      componentId: 'palatine-hill',
      placeId: 'ChIJowJff7VhLxMRLmHQKoSniFE',
      name: 'Palatine Hill',
      formattedAddress: '00186 Rome, Metropolitan City of Rome Capital, Italy',
      location: { latitude: 41.889_423, longitude: 12.487_466 },
      googleMapsUri: 'https://maps.google.com/?cid=palatine-hill',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-19T08:01:00Z',
    },
    {
      attractionId: 'capitoline-museums',
      componentId: 'capitoline-museums',
      placeId: 'ChIJ8-wGeU9gLxMR--zJtnpGod4',
      name: 'Capitoline Museums',
      formattedAddress: 'Piazza del Campidoglio, 1, 00186 Roma RM, Italy',
      location: { latitude: 41.892_942_8, longitude: 12.482_557_7 },
      googleMapsUri: 'https://maps.google.com/?cid=capitoline-museums',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-21T08:31:00Z',
    },
    {
      attractionId: 'st-peters-basilica',
      componentId: 'st-peters-basilica',
      placeId: 'ChIJWZsUt2FgLxMRg1KHzXfwS3I',
      name: "Saint Peter's Basilica",
      formattedAddress: 'Piazza San Pietro, 00120 Citta del Vaticano',
      location: { latitude: 41.902_166_7, longitude: 12.453_936_7 },
      googleMapsUri: 'https://maps.google.com/?cid=st-peters-basilica',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-21T08:31:00Z',
    },
    {
      attractionId: 'castel-sant-angelo',
      componentId: 'castel-sant-angelo',
      placeId: 'ChIJ0aTnEYeKJRMRiUF95xwRbDY',
      name: "Castel Sant'Angelo",
      formattedAddress: 'Lungotevere Castello, 50, 00193 Roma RM, Italy',
      location: { latitude: 41.903_063_2, longitude: 12.466_276 },
      googleMapsUri: 'https://maps.google.com/?cid=castel-sant-angelo',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-21T08:31:00Z',
    },
    {
      attractionId: 'domus-aurea',
      componentId: 'domus-aurea',
      placeId: 'ChIJp-3oaLdhLxMRS_bYIp1GB8w',
      name: 'Domus Aurea',
      formattedAddress: 'Via della Domus Aurea, 1, 00184 Roma RM, Italy',
      location: { latitude: 41.891_076, longitude: 12.495_715 },
      googleMapsUri: 'https://maps.google.com/?cid=domus-aurea',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-21T08:31:00Z',
    },
    {
      attractionId: 'trevi-fountain',
      componentId: 'trevi-fountain',
      placeId: 'ChIJ1UCDJ1NgLxMRtrsCzOHxdvY',
      name: 'Trevi Fountain',
      formattedAddress: 'Piazza di Trevi, 00187 Roma RM, Italy',
      location: { latitude: 41.900_932_5, longitude: 12.483_313 },
      googleMapsUri: 'https://maps.google.com/?cid=trevi-fountain',
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-21T08:31:00Z',
    },
  ],
}

function renderResults(route = resultsRoute) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <ResultsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function successfulResponseFor(input: RequestInfo | URL) {
  const url = String(input)
  if (url.includes('/booking-priorities?')) {
    return jsonResponse(priorityResponse)
  }
  if (url.endsWith('/places')) {
    return jsonResponse(placeResponse)
  }
  return jsonResponse(ticketResponse)
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('ResultsPage', () => {
  it('keeps the card grid stable and opens evidence in a separate dialog', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn((input: RequestInfo | URL) =>
      Promise.resolve(successfulResponseFor(input)),
    )
    vi.stubGlobal('fetch', fetchMock)

    renderResults()

    expect(
      await screen.findByRole('heading', { name: 'Pantheon' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Borghese Gallery' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Baths of Caracalla' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Capitoline Museums' }),
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /View details for/ }),
    ).toHaveLength(10)
    expect(
      screen.getByRole('region', { name: 'Rome attraction results' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('10 attractions in booking order'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Book first')).toHaveLength(3)
    expect(screen.getByText('Book soon')).toBeInTheDocument()
    expect(screen.getAllByText('Can wait')).toHaveLength(3)
    expect(screen.getAllByText('Check official source')).toHaveLength(3)
    expect(screen.queryByText('Verified Rome mapping')).not.toBeInTheDocument()
    expect(screen.queryByText('Official rules')).not.toBeInTheDocument()
    expect(screen.queryByText('Environment')).not.toBeInTheDocument()

    const pantheonButton = screen.getByRole('button', {
      name: 'View details for Pantheon',
    })
    expect(
      pantheonButton.closest('article')?.querySelector('details'),
    ).toBeNull()
    await user.click(pantheonButton)

    const pantheonDialog = await screen.findByRole('dialog', {
      name: 'Pantheon',
    })
    expect(
      within(pantheonDialog).getByRole('heading', {
        name: 'Booking decision',
      }),
    ).toBeInTheDocument()
    expect(within(pantheonDialog).getByText('What to do')).toBeInTheDocument()
    expect(within(pantheonDialog).getByText('When to act')).toBeInTheDocument()
    expect(
      within(pantheonDialog).getByText('Official confidence'),
    ).toBeInTheDocument()
    expect(
      within(pantheonDialog).getByRole('heading', {
        name: 'Useful at a glance',
      }),
    ).toBeInTheDocument()

    const officialDisclosure = within(pantheonDialog)
      .getByText('Official evidence')
      .closest('details')
    const locationDisclosure = within(pantheonDialog)
      .getByText('Locations and map links')
      .closest('details')
    const thirdPartyDisclosure = within(pantheonDialog)
      .getByText('Third-party Sandbox details')
      .closest('details')
    expect(officialDisclosure).not.toHaveAttribute('open')
    expect(locationDisclosure).not.toHaveAttribute('open')
    expect(thirdPartyDisclosure).not.toHaveAttribute('open')

    await user.click(within(pantheonDialog).getByText('Official evidence'))
    expect(officialDisclosure).toHaveAttribute('open')
    expect(
      within(pantheonDialog).getByRole('link', {
        name: 'Open official source',
      }),
    ).toHaveAttribute('href', 'https://official.example/pantheon')

    await user.click(
      within(pantheonDialog).getByText('Locations and map links'),
    )
    expect(locationDisclosure).toHaveAttribute('open')
    expect(
      within(pantheonDialog).getAllByText(
        'Piazza della Rotonda, 00186 Roma RM, Italy',
      ),
    ).toHaveLength(2)
    expect(
      within(pantheonDialog).getAllByText('Operational in Google Places'),
    ).toHaveLength(2)
    expect(
      within(pantheonDialog).getByRole('link', {
        name: 'Open Pantheon in Google Maps',
      }),
    ).toHaveAttribute('href', 'https://maps.google.com/?cid=example')

    await user.click(
      within(pantheonDialog).getByText('Third-party Sandbox details'),
    )
    expect(thirdPartyDisclosure).toHaveAttribute('open')
    expect(
      within(pantheonDialog).getByText('Published schedule found'),
    ).toBeInTheDocument()
    expect(
      within(pantheonDialog).getAllByText(/From\s+€17\.00/),
    ).toHaveLength(2)
    expect(
      within(pantheonDialog).getByText(
        'Sandbox summary price, not a live quote.',
      ),
    ).toBeInTheDocument()
    expect(
      within(pantheonDialog).getByText(/Third-party source: viator SANDBOX/),
    ).toBeInTheDocument()

    await user.click(
      within(pantheonDialog).getByRole('button', {
        name: 'Close details for Pantheon',
      }),
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'View details for Colosseum, Roman Forum and Palatine Hill',
      }),
    )
    const colosseumDialog = await screen.findByRole('dialog', {
      name: 'Colosseum, Roman Forum and Palatine Hill',
    })
    await user.click(
      within(colosseumDialog).getByText('Locations and map links'),
    )
    expect(
      within(colosseumDialog).getByText(
        'This attraction group contains 3 separately verified locations.',
      ),
    ).toBeInTheDocument()
    await user.click(
      within(colosseumDialog).getByText('Third-party Sandbox details'),
    )
    expect(within(colosseumDialog).getByText('Guided tour')).toBeInTheDocument()
    await user.click(
      within(colosseumDialog).getByRole('button', {
        name: 'Close details for Colosseum, Roman Forum and Palatine Hill',
      }),
    )

    await user.click(
      screen.getByRole('button', {
        name: 'View details for Vatican Museums and Sistine Chapel',
      }),
    )
    const vaticanDialog = await screen.findByRole('dialog', {
      name: 'Vatican Museums and Sistine Chapel',
    })
    await user.click(within(vaticanDialog).getByText('Locations and map links'))
    expect(
      within(vaticanDialog).getByText(
        'This attraction group contains 2 separately verified locations.',
      ),
    ).toBeInTheDocument()
    await user.click(
      within(vaticanDialog).getByText('Third-party Sandbox details'),
    )
    expect(
      within(vaticanDialog).getByText('Affiliate ticket product'),
    ).toBeInTheDocument()
    expect(
      within(vaticanDialog).getByText(
        'The available options must be checked on the provider page before booking.',
      ),
    ).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/api/v1/rome/places', {
      headers: { Accept: 'application/json' },
    })
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/rome/booking-priorities?stayStartDate=2026-09-10&stayEndDate=2026-09-12',
      { headers: { Accept: 'application/json' } },
    )
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/rome/attractions?stayStartDate=2026-09-10&stayEndDate=2026-09-12',
      { headers: { Accept: 'application/json' } },
    )
  })

  it('lets the user focus a verified attraction on the map', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) =>
        Promise.resolve(successfulResponseFor(input)),
      ),
    )

    renderResults()

    for (const priority of priorityResponse.priorities) {
      const heading = await screen.findByRole('heading', {
        name: priority.attractionName,
      })
      const card = heading.closest('article')
      expect(card).not.toBeNull()
      expect(
        within(card as HTMLElement).getByRole('button', {
          name: 'Show on map',
        }),
      ).toBeInTheDocument()
    }

    const borgheseHeading = await screen.findByRole('heading', {
      name: 'Borghese Gallery',
    })
    const borgheseCard = borgheseHeading.closest('article')
    expect(borgheseCard).not.toBeNull()
    const mapButton = within(borgheseCard as HTMLElement).getByRole('button', {
      name: 'Show on map',
    })
    await user.click(mapButton)

    expect(screen.getByText(/Focused location:/)).toHaveTextContent(
      'Focused location: Galleria Borghese',
    )
    expect(mapButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('keeps ticket provider failures out of the result summary', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/booking-priorities?')) {
          return Promise.resolve(jsonResponse(priorityResponse))
        }
        if (url.endsWith('/places')) {
          return Promise.resolve(jsonResponse(placeResponse))
        }
        return Promise.resolve(jsonResponse({}, 503))
      }),
    )

    renderResults()

    await screen.findByRole('heading', { name: 'Pantheon' })
    expect(
      screen.queryByText(
        'Third-party ticket evidence is temporarily unavailable.',
      ),
    ).not.toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'View details for Pantheon' }),
    )
    const dialog = await screen.findByRole('dialog', { name: 'Pantheon' })
    await user.click(within(dialog).getByText('Locations and map links'))
    expect(
      within(dialog).getAllByText('Piazza della Rotonda, 00186 Roma RM, Italy'),
    ).toHaveLength(2)
    await user.click(within(dialog).getByText('Third-party Sandbox details'))
    expect(
      within(dialog).getByText(
        'No Viator Sandbox option is mapped for this attraction. This is not treated as sold out.',
      ),
    ).toBeInTheDocument()
  })

  it('keeps ticket evidence when the location provider fails', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/booking-priorities?')) {
          return Promise.resolve(jsonResponse(priorityResponse))
        }
        if (url.endsWith('/places')) {
          return Promise.resolve(jsonResponse({}, 503))
        }
        return Promise.resolve(jsonResponse(ticketResponse))
      }),
    )

    renderResults()

    expect(
      await screen.findByText('Location evidence is temporarily unavailable.'),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'View details for Pantheon' }),
    )
    const dialog = await screen.findByRole('dialog', { name: 'Pantheon' })
    await user.click(within(dialog).getByText('Third-party Sandbox details'))
    expect(
      within(dialog).getByText('Published schedule found'),
    ).toBeInTheDocument()
    await user.click(within(dialog).getByText('Locations and map links'))
    expect(
      within(dialog).getByText(
        /Verified location evidence is temporarily unavailable/,
      ),
    ).toBeInTheDocument()
  })

  it('does not infer booking priority from third-party ticket data', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) => {
        const url = String(input)
        if (url.includes('/booking-priorities?')) {
          return Promise.resolve(jsonResponse({}, 503))
        }
        if (url.endsWith('/places')) {
          return Promise.resolve(jsonResponse(placeResponse))
        }
        return Promise.resolve(jsonResponse(ticketResponse))
      }),
    )

    renderResults()

    expect(
      await screen.findByText('Booking priority is temporarily unavailable.'),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'View details for Pantheon' }),
    )
    const dialog = await screen.findByRole('dialog', { name: 'Pantheon' })
    expect(
      within(dialog).getByText(
        'Booking priority is temporarily unavailable. No urgency is inferred from third-party ticket data.',
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText('Book first')).not.toBeInTheDocument()
  })

  it('does not request evidence without a complete Rome query', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    renderResults('/results')

    expect(
      screen.getByRole('heading', { name: 'Choose your stay first.' }),
    ).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
