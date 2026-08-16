import { expect, test } from '@playwright/test'

test('loads the application shell', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: 'Attraction Booking Intelligence' }),
  ).toBeVisible()
  await expect(
    page.getByText('There is no real ticket data yet.'),
  ).toBeVisible()
})
