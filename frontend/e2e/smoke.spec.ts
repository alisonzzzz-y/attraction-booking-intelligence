import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/rome/booking-priorities?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        city: 'Rome',
        stayStartDate: '2026-09-10',
        stayEndDate: '2026-09-12',
        generatedAt: '2026-08-23T08:00:00Z',
        priorities: [],
      }),
    })
  })
})

test('loads the public preview and opens the methodology page', async ({
  page,
}) => {
  await page.goto('/')

  await expect(
    page.getByRole('link', { name: 'Attraction Booking Intelligence home' }),
  ).toContainText('Attraction Booking Intelligence')
  await expect(page.locator('.brand-mark')).toHaveCount(0)
  await expect(page.locator('.site-header')).toHaveCSS(
    'background-image',
    /linear-gradient/,
  )
  await expect(
    page.getByRole('heading', {
      name: 'Plan the attractions that cannot wait.',
    }),
  ).toBeVisible()
  await expect(page.getByText('Sandbox connected')).toBeVisible()

  await page.getByRole('link', { name: 'Methodology' }).click()

  await expect(
    page.getByRole('heading', {
      name: 'A ticket fact needs evidence, context, and a clock.',
    }),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/methodology$/)
})

test('keeps Rome stay dates in the results URL', async ({ page }) => {
  await page.route('**/api/v1/rome/attractions?**', async (route) => {
    await route.fulfill({ status: 503 })
  })
  await page.route('**/api/v1/rome/places', async (route) => {
    await route.fulfill({ status: 503 })
  })
  await page.goto('/plan')

  await page.getByLabel('Arrival date').fill('2026-09-10')
  await page.getByLabel('Departure date').fill('2026-09-12')
  await page.getByRole('button', { name: 'Find Rome attractions' }).click()

  await expect(
    page.getByRole('heading', { name: 'What should I book first?' }),
  ).toBeVisible()
  await expect(page.locator('.results-header')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  )
  await expect(page.locator('.results-header')).toHaveCSS(
    'border-bottom-style',
    'solid',
  )
  await expect(page).toHaveURL(
    /\/results\?city=rome&stayStartDate=2026-09-10&stayEndDate=2026-09-12$/,
  )
  await expect(
    page.getByText('Third-party ticket evidence is temporarily unavailable.'),
  ).toHaveCount(0)
  await expect(page.getByText('This is not treated as sold out.')).toHaveCount(
    0,
  )
})

test('renders the verified Colosseum group without treating a guided tour as basic admission', async ({
  page,
}) => {
  await page.route('**/api/v1/rome/attractions?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        city: 'Rome',
        provider: 'viator',
        environment: 'SANDBOX',
        partialFailure: false,
        attractions: [
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
        ],
        errors: [],
      }),
    })
  })
  await page.route('**/api/v1/rome/places', async (route) => {
    const places = [
      ['colosseum', 'Colosseum', 41.89021, 12.492231],
      ['roman-forum', 'Roman Forum', 41.892462, 12.485325],
      ['palatine-hill', 'Palatine Hill', 41.889423, 12.487466],
    ].map(([componentId, name, latitude, longitude]) => ({
      attractionId: 'colosseum-archaeological-park',
      componentId,
      placeId: `test-${componentId}`,
      name,
      formattedAddress: `${name}, Rome, Italy`,
      location: { latitude, longitude },
      googleMapsUri: `https://maps.google.com/?q=${componentId}`,
      businessStatus: 'OPERATIONAL',
      retrievedAt: '2026-08-19T08:01:00Z',
    }))

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        city: 'Rome',
        source: 'google-places',
        attractions: places,
      }),
    })
  })

  await page.goto(
    '/results?city=rome&stayStartDate=2026-09-10&stayEndDate=2026-09-12',
  )

  await expect(
    page.getByRole('heading', { name: 'Colosseum Archaeological Park' }),
  ).toBeVisible()
  const colosseumCard = page.locator('.result-card').first()
  await expect(colosseumCard.getByText('Third-party option')).toBeVisible()
  const detailsButton = colosseumCard.getByRole('button', {
    name: 'View details for Colosseum Archaeological Park',
  })
  await expect(detailsButton).toBeVisible()
  await page
    .getByRole('button', {
      name: 'View details for Colosseum Archaeological Park',
    })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Colosseum Archaeological Park',
  })
  await dialog.getByText('Supporting evidence').click()
  await expect(
    dialog.getByText(
      'This attraction group contains 3 separately verified locations.',
    ),
  ).toBeVisible()
  await expect(dialog.getByText('Guided tour')).toBeVisible()
  await page
    .getByRole('button', {
      name: 'Close details for Colosseum Archaeological Park',
    })
    .click()
  await expect(colosseumCard).not.toHaveAttribute('aria-current', 'true')
  await expect(
    page.getByRole('button', { name: /Show(?:n)? on map/ }),
  ).toHaveCount(0)
  await colosseumCard.click()
  await expect(colosseumCard).toHaveAttribute('aria-current', 'true')
  await expect(page.getByLabel('Selected map location')).toContainText(
    'Colosseum · Roman Forum · Palatine Hill',
  )
})

test('renders the Vatican Museums and Sistine Chapel as one verified ticket group', async ({
  page,
}) => {
  await page.route('**/api/v1/rome/attractions?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        city: 'Rome',
        provider: 'viator',
        environment: 'SANDBOX',
        partialFailure: false,
        attractions: [
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
        ],
        errors: [],
      }),
    })
  })
  await page.route('**/api/v1/rome/places', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        city: 'Rome',
        source: 'google-places',
        attractions: [
          {
            attractionId: 'vatican-museums-sistine-chapel',
            componentId: 'vatican-museums',
            placeId: 'test-vatican-museums',
            name: 'Vatican Museums',
            formattedAddress: '00120, Vatican City',
            location: { latitude: 41.906488, longitude: 12.453641 },
            googleMapsUri: 'https://maps.google.com/?q=vatican-museums',
            businessStatus: 'OPERATIONAL',
            retrievedAt: '2026-08-20T08:01:00Z',
          },
          {
            attractionId: 'vatican-museums-sistine-chapel',
            componentId: 'sistine-chapel',
            placeId: 'test-sistine-chapel',
            name: 'Sistine Chapel',
            formattedAddress: '00120, Vatican City',
            location: { latitude: 41.902947, longitude: 12.454484 },
            googleMapsUri: 'https://maps.google.com/?q=sistine-chapel',
            businessStatus: 'OPERATIONAL',
            retrievedAt: '2026-08-20T08:01:00Z',
          },
        ],
      }),
    })
  })

  await page.goto(
    '/results?city=rome&stayStartDate=2026-09-10&stayEndDate=2026-09-12',
  )

  await expect(
    page.getByRole('heading', {
      name: 'Vatican Museums and Sistine Chapel',
    }),
  ).toBeVisible()
  await page
    .getByRole('button', {
      name: 'View details for Vatican Museums and Sistine Chapel',
    })
    .click()
  const dialog = page.getByRole('dialog', {
    name: 'Vatican Museums and Sistine Chapel',
  })
  await dialog.getByText('Supporting evidence').click()
  await expect(
    dialog.getByText(
      'This attraction group contains 2 separately verified locations.',
    ),
  ).toBeVisible()
  await expect(
    dialog.getByText('Vatican Museums', { exact: true }),
  ).toBeVisible()
  await expect(
    dialog.getByText('Sistine Chapel', { exact: true }),
  ).toBeVisible()
  await expect(dialog.getByText('Affiliate ticket product')).toBeVisible()
  await expect(dialog.getByText('From €69.00', { exact: true })).toBeVisible()
  await expect(
    dialog.getByText(/Sandbox evidence, not live availability/),
  ).toBeVisible()
})

test('labels the Baths of Caracalla affiliate bundle separately from official basic admission', async ({
  page,
}) => {
  await page.route('**/api/v1/rome/attractions?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        city: 'Rome',
        provider: 'viator',
        environment: 'SANDBOX',
        partialFailure: false,
        attractions: [
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
        ],
        errors: [],
      }),
    })
  })
  await page.route('**/api/v1/rome/places', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        city: 'Rome',
        source: 'google-places',
        attractions: [
          {
            attractionId: 'baths-of-caracalla',
            componentId: 'baths-of-caracalla',
            placeId: 'test-baths-of-caracalla',
            name: 'Baths of Caracalla',
            formattedAddress:
              'Viale delle Terme di Caracalla, 00153 Roma RM, Italy',
            location: { latitude: 41.8790382, longitude: 12.4924394 },
            googleMapsUri: 'https://maps.google.com/?q=baths-of-caracalla',
            businessStatus: 'OPERATIONAL',
            retrievedAt: '2026-08-21T08:01:00Z',
          },
        ],
      }),
    })
  })

  await page.goto(
    '/results?city=rome&stayStartDate=2026-09-10&stayEndDate=2026-09-12',
  )

  await expect(
    page.getByRole('heading', { name: 'Baths of Caracalla' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'View details for Baths of Caracalla' })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Baths of Caracalla' })
  await expect(dialog.getByText('Ticket with audio guide')).toBeVisible()
  await expect(dialog.getByText('From €15.00', { exact: true })).toBeVisible()
  await expect(
    dialog.getByText(/Sandbox evidence, not live availability/),
  ).toBeVisible()
})

test('shows the Capitoline Museums Sandbox ticket without presenting it as the official price', async ({
  page,
}) => {
  await page.route('**/api/v1/rome/attractions?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        city: 'Rome',
        provider: 'viator',
        environment: 'SANDBOX',
        partialFailure: false,
        attractions: [
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
      }),
    })
  })
  await page.route('**/api/v1/rome/places', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        city: 'Rome',
        source: 'google-places',
        attractions: [
          {
            attractionId: 'capitoline-museums',
            componentId: 'capitoline-museums',
            placeId: 'test-capitoline-museums',
            name: 'Capitoline Museums',
            formattedAddress: 'Piazza del Campidoglio, 1, 00186 Roma RM, Italy',
            location: { latitude: 41.8929428, longitude: 12.4825577 },
            googleMapsUri: 'https://maps.google.com/?q=capitoline-museums',
            businessStatus: 'OPERATIONAL',
            retrievedAt: '2026-08-21T08:31:00Z',
          },
        ],
      }),
    })
  })

  await page.goto(
    '/results?city=rome&stayStartDate=2026-09-10&stayEndDate=2026-09-12',
  )

  await expect(
    page.getByRole('heading', { name: 'Capitoline Museums' }),
  ).toBeVisible()
  await page
    .getByRole('button', { name: 'View details for Capitoline Museums' })
    .click()
  const dialog = page.getByRole('dialog', { name: 'Capitoline Museums' })
  await expect(dialog.getByText('Affiliate ticket product')).toBeVisible()
  await expect(dialog.getByText('From €30.00', { exact: true })).toBeVisible()
  await expect(
    dialog.getByText(/Sandbox evidence, not live availability/),
  ).toBeVisible()
  await expect(dialog.getByText('viator', { exact: true })).toBeVisible()
  await expect(dialog.getByText(/official price/i)).toHaveCount(0)
})

test('keeps the public preview within a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')

  await expect(
    page.getByRole('navigation', { name: 'Primary navigation' }),
  ).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'See how the data works' }),
  ).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  )
  expect(hasHorizontalOverflow).toBe(false)
})
