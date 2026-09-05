import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { CredentialsPage } from './CredentialsPage'
import { EmailActionPage } from './EmailActionPage'
import { setUser } from './authStore'

beforeEach(() => { setUser(null); window.history.replaceState(null, '', '/') })
afterEach(() => vi.unstubAllGlobals())
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status })

it('submits registration with CSRF and shows the neutral email notice', async () => {
  const fetch = vi.fn(async (url: string) => url.endsWith('/csrf') ? json({ token: 'csrf' }) : new Response(null, { status: 202 }))
  vi.stubGlobal('fetch', fetch)
  render(<MemoryRouter><CredentialsPage mode="register" /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('E-posta adresi'), { target: { value: 'test@example.test' } })
  fireEvent.change(screen.getByLabelText('Şifre'), { target: { value: 'test-password-123' } })
  fireEvent.click(screen.getByRole('button', { name: 'Hesap oluştur' }))
  await screen.findByRole('heading', { name: 'E-postanı kontrol et.' })
  expect(fetch.mock.calls.filter(([url]) => url.endsWith('/register'))).toHaveLength(1)
})

it('shows unverified email feedback and a working resend link', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => url.endsWith('/csrf') ? json({ token: 'csrf' }) : json({ code: 'EMAIL_UNVERIFIED' }, 403)))
  render(<MemoryRouter><CredentialsPage mode="login" /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('E-posta adresi'), { target: { value: 'test@example.test' } })
  fireEvent.change(screen.getByLabelText('Şifre'), { target: { value: 'test-password-123' } })
  fireEvent.click(screen.getByRole('button', { name: 'Giriş yap' }))
  expect(await screen.findByRole('alert')).toHaveTextContent('e-posta adresini doğrula')
  expect(screen.getByRole('link', { name: 'Doğrulama bağlantısı iste' })).toHaveAttribute('href', '/resend-verification')
})

it('does not consume a verification token merely by opening the email link', async () => {
  window.history.replaceState(null, '', '/verify-email#token=test-token')
  const fetch = vi.fn(async (url: string) => url.endsWith('/csrf') ? json({ token: 'csrf' }) : new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetch)
  render(<MemoryRouter><EmailActionPage mode="verify" /></MemoryRouter>)
  expect(fetch).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'E-postamı doğrula' }))
  await screen.findByRole('heading', { name: 'E-postan doğrulandı.' })
  expect(window.location.hash).toBe('')
})

it('associates validation errors with inputs and prevents duplicate submissions', async () => {
  let finish: ((value: Response) => void) | undefined
  const fetch = vi.fn(async (url: string) => url.endsWith('/csrf') ? json({ token: 'csrf' }) : new Promise<Response>(resolve => { finish = resolve }))
  vi.stubGlobal('fetch', fetch)
  render(<MemoryRouter><CredentialsPage mode="register" /></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('E-posta adresi'), { target: { value: 'test@example.test' } })
  fireEvent.change(screen.getByLabelText('Şifre'), { target: { value: 'test-password-123' } })
  const button = screen.getByRole('button', { name: 'Hesap oluştur' })
  fireEvent.click(button); fireEvent.click(button)
  expect(button).toBeDisabled()
  await waitFor(() => expect(finish).toBeDefined())
  finish?.(json({ code: 'VALIDATION_FAILED', fieldErrors: { password: 'invalid' } }, 400))
  await screen.findByRole('alert')
  expect(screen.getByLabelText('Şifre')).toHaveAttribute('aria-invalid', 'true')
  expect(fetch.mock.calls.filter(([url]) => url.endsWith('/register'))).toHaveLength(1)
})

it('navigates to the account only after a successful real-shaped login response', async () => {
  vi.stubGlobal('fetch', vi.fn(async (url: string) => url.endsWith('/csrf') ? json({ token: 'csrf' })
    : json({ id: 'id', email: 'test@example.test', role: 'USER', profileCompleted: false })))
  render(<MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<CredentialsPage mode="login" />} />
    <Route path="/account" element={<h1>Hesabım</h1>} /></Routes></MemoryRouter>)
  fireEvent.change(screen.getByLabelText('E-posta adresi'), { target: { value: 'test@example.test' } })
  fireEvent.change(screen.getByLabelText('Şifre'), { target: { value: 'test-password-123' } })
  fireEvent.click(screen.getByRole('button', { name: 'Giriş yap' }))
  await screen.findByRole('heading', { name: 'Hesabım' })
})
