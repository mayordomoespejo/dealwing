import { test, expect } from '@playwright/test'

test.describe('DealWing — search flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('page title is DealWing', async ({ page }) => {
    await expect(page).toHaveTitle(/DealWing/)
  })

  test('header shows logo and nav links', async ({ page }) => {
    await expect(page.getByText('DealWing')).toBeVisible()
    await expect(page.getByRole('link', { name: /search/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /saved/i })).toBeVisible()
  })

  test('search form is visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: /search flights/i })).toBeVisible()
  })

  test('/ keyboard shortcut focuses origin field', async ({ page }) => {
    await page.keyboard.press('/')
    const input = page.locator('input[name="origin"]')
    await expect(input).toBeFocused()
  })

  test('can navigate to Saved page', async ({ page }) => {
    await page.getByRole('link', { name: /saved/i }).click()
    await expect(page).toHaveURL('/saved')
    await expect(page.getByText(/saved flights/i)).toBeVisible()
  })
})
