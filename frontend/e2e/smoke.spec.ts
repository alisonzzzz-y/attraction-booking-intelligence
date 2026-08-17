import { expect, test } from '@playwright/test'

test('loads the public preview and opens the methodology page', async ({
  page,
}) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', {
      name: 'Plan the attractions that cannot wait.',
    }),
  ).toBeVisible()
  await expect(page.getByText('Pre-API phase')).toBeVisible()

  await page.getByRole('link', { name: 'Methodology' }).click()

  await expect(
    page.getByRole('heading', {
      name: 'A ticket fact needs evidence, context, and a clock.',
    }),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/methodology$/)
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
