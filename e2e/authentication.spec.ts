import { expect, test } from '@playwright/test'
import { randomUUID } from 'node:crypto'

import { mailLink } from './mailbox'

test('registration, email verification, cookie rotation, password reset and logout work together', async ({ page, context, request }, testInfo) => {
  const email = `browser-${randomUUID()}@example.test`
  const password = 'Browser-test-password-123!'
  await page.goto('/register')
  await page.getByLabel('E-posta adresi').fill(email)
  await page.getByLabel('Şifre', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Hesap oluştur' }).click()
  await expect(page.getByRole('heading', { name: 'E-postanı kontrol et.' })).toBeVisible()
  await page.goto(await mailLink(request, email, 'verify-email'))
  await page.getByRole('button', { name: 'E-postamı doğrula' }).click()
  await expect(page.getByRole('heading', { name: 'E-postan doğrulandı.' })).toBeVisible()
  await page.getByRole('main').getByRole('link', { name: 'Giriş yap', exact: true }).click()
  await page.getByLabel('E-posta adresi').fill(email)
  await page.getByLabel('Şifre', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Giriş yap' }).click()
  await expect(page.getByRole('heading', { name: 'İyi ki geldin.' })).toBeVisible()
  const cookies = await context.cookies()
  expect(cookies.filter(cookie => ['TV_ACCESS', 'TV_REFRESH'].includes(cookie.name)).length).toBe(2)
  expect(cookies.filter(cookie => ['TV_ACCESS', 'TV_REFRESH'].includes(cookie.name)).every(cookie => cookie.httpOnly && cookie.sameSite === 'Lax')).toBe(true)
  expect(await page.evaluate(() => /TV_ACCESS|TV_REFRESH/.test(document.cookie))).toBe(false)
  expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: testInfo.outputPath('account.png'), fullPage: true })

  // Two tabs with a missing access cookie share one refresh rotation via Web Locks.
  const oldRefresh = cookies.find(cookie => cookie.name === 'TV_REFRESH')!.value
  await context.clearCookies({ name: 'TV_ACCESS' })
  const other = await context.newPage()
  await Promise.all([page.reload(), other.goto('/account')])
  await expect(page.getByRole('heading', { name: 'İyi ki geldin.' })).toBeVisible()
  await expect(other.getByRole('heading', { name: 'İyi ki geldin.' })).toBeVisible()
  expect((await context.cookies()).find(cookie => cookie.name === 'TV_REFRESH')!.value === oldRefresh).toBe(false)
  await other.close()

  await page.goto('/forgot-password')
  await page.getByLabel('E-posta adresi').fill(email)
  await page.getByRole('button', { name: 'Bağlantı gönder' }).click()
  await expect(page.getByRole('heading', { name: 'E-postanı kontrol et.' })).toBeVisible()
  await page.goto(await mailLink(request, email, 'reset-password'))
  await page.getByLabel('Yeni şifre').fill('Changed-browser-password-456!')
  await page.getByRole('button', { name: 'Şifremi yenile' }).click()
  await expect(page.getByRole('heading', { name: 'Şifren yenilendi.' })).toBeVisible()
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login$/)
  await page.getByLabel('E-posta adresi').fill(email)
  await page.getByLabel('Şifre', { exact: true }).fill('Changed-browser-password-456!')
  await page.getByRole('button', { name: 'Giriş yap' }).click()
  await expect(page.getByRole('heading', { name: 'İyi ki geldin.' })).toBeVisible()
  await page.getByRole('button', { name: 'Çıkış yap' }).click()
  await expect(page).toHaveURL(/\/login$/)
  await page.goto('/account')
  await expect(page).toHaveURL(/\/login$/)
})
