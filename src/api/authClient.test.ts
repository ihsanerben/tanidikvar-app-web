import { beforeEach, afterEach, expect, it, vi } from 'vitest'

beforeEach(() => vi.resetModules())
afterEach(() => vi.unstubAllGlobals())
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status })
const denied = () => json({ code: 'AUTHENTICATION_REQUIRED' }, 401)

it('adds the CSRF token to mutations and keeps credentials out of browser storage', async () => {
  const fetch = vi.fn().mockResolvedValueOnce(json({ token: 'csrf-value' })).mockResolvedValueOnce(new Response(null, { status: 202 }))
  vi.stubGlobal('fetch', fetch)
  const { authPost } = await import('./apiClient')
  await expect(authPost('/api/auth/register', { email: 'a@example.test', password: 'example-password' })).resolves.toBeUndefined()
  expect(fetch.mock.calls[1][1]).toMatchObject({ method: 'POST', credentials: 'include', headers: { 'X-XSRF-TOKEN': 'csrf-value' } })
  expect(localStorage.length).toBe(0); expect(sessionStorage.length).toBe(0)
})

it('coordinates parallel 401 responses into a single refresh and retries each request once', async () => {
  let refreshed = false
  let refreshes = 0
  const fetch = vi.fn(async (url: string) => {
    if (url.endsWith('/api/auth/csrf')) return json({ token: 'csrf' })
    if (url.endsWith('/api/auth/refresh')) { refreshes++; refreshed = true; return json({ ok: true }) }
    if (url.endsWith('/api/me')) return denied()
    return refreshed ? json({ ok: true }) : denied()
  })
  vi.stubGlobal('fetch', fetch)
  const { apiGet } = await import('./apiClient')
  expect(await Promise.all([apiGet('/api/private/a'), apiGet('/api/private/b')])).toEqual([{ ok: true }, { ok: true }])
  expect(refreshes).toBe(1)
  expect(fetch.mock.calls.filter(([url]) => url.endsWith('/api/private/a'))).toHaveLength(2)
  expect(fetch.mock.calls.filter(([url]) => url.endsWith('/api/private/b'))).toHaveLength(2)
})

it('does not loop after a second 401 and announces expired authentication', async () => {
  const expired = vi.fn()
  window.addEventListener('auth:expired', expired)
  vi.stubGlobal('fetch', vi.fn(async (url: string) => url.endsWith('/api/auth/csrf') ? json({ token: 'csrf' })
    : url.endsWith('/api/auth/refresh') ? json({ ok: true }) : denied()))
  const { apiGet } = await import('./apiClient')
  await expect(apiGet('/api/private')).rejects.toMatchObject({ status: 401 })
  expect(expired).toHaveBeenCalledTimes(1)
  window.removeEventListener('auth:expired', expired)
})

it('never refreshes failed login requests', async () => {
  const fetch = vi.fn(async (url: string) => url.endsWith('/csrf') ? json({ token: 'csrf' }) : denied())
  vi.stubGlobal('fetch', fetch)
  const { authPost } = await import('./apiClient')
  await expect(authPost('/api/auth/login', {})).rejects.toMatchObject({ status: 401 })
  expect(fetch.mock.calls.some(([url]) => url.endsWith('/refresh'))).toBe(false)
})

it('uses another tab’s successful refresh without rotating again', async () => {
  let initial = true
  const fetch = vi.fn(async (url: string) => {
    if (url.endsWith('/api/private') && initial) { initial = false; return denied() }
    return json({ ok: true })
  })
  vi.stubGlobal('fetch', fetch)
  const { apiGet } = await import('./apiClient')
  await expect(apiGet('/api/private')).resolves.toEqual({ ok: true })
  expect(fetch.mock.calls.some(([url]) => url.endsWith('/refresh'))).toBe(false)
})

it('preserves Retry-After and safe field errors', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'RATE_LIMITED', fieldErrors: { password: 'unsafe backend text' } }), { status: 429, headers: { 'Retry-After': '90' } })))
  const { apiGet } = await import('./apiClient')
  await expect(apiGet('/api/private')).rejects.toMatchObject({ retryAfter: 90, fieldErrors: { password: expect.not.stringContaining('unsafe') } })
})

it('does not retry stale requests after logout begins', async () => {
  let finish: ((response: Response) => void) | undefined
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { finish = resolve })))
  const { apiGet, invalidateSession } = await import('./apiClient')
  const request = apiGet('/api/private')
  invalidateSession(); finish?.(denied())
  await expect(request).rejects.toMatchObject({ status: 401 })
})
