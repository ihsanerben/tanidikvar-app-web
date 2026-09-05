import { expect, test } from '@playwright/test'

test('home is responsive and connects to the actual API', async ({ page }, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tercih yolunda')
  await expect(page.getByRole('link', { name: 'Kayıt ol', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true })
  await page.getByRole('link', { name: 'TanıdıkVar’ı keşfet' }).click()
  await expect(page).toHaveURL(/#nasil-calisir$/)
  await page.getByRole('link', { name: 'Sistem durumu' }).click()
  await expect(page.getByRole('heading', { name: 'Bağlantı hazır' })).toBeVisible()
  expect(errors).toEqual([])
})

test('direct navigation and unknown pages work', async ({ page }) => {
  await page.goto('/durum')
  await expect(page.getByRole('heading', { name: 'Bağlantı hazır' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Bağlantı hazır' })).toBeVisible()
  await page.goto('/olmayan-sayfa')
  await expect(page.getByRole('heading', { name: 'Bu sayfayı bulamadık.' })).toBeVisible()
  await page.getByRole('link', { name: 'Ana sayfaya dön' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tercih yolunda')
})
