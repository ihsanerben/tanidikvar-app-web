const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId?: string
  readonly fieldErrors: Record<string, string>
  readonly retryAfter?: number
  constructor(status: number, code: string, message: string,
    requestId?: string, fieldErrors: Record<string, string> = {}, retryAfter?: number,
  ) {
    super(message); this.name = 'ApiError'
    this.status = status; this.code = code; this.requestId = requestId
    this.fieldErrors = fieldErrors; this.retryAfter = retryAfter
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

const messages: Record<string, string> = {
  AUTHENTICATION_REQUIRED: 'E-posta veya şifre hatalı ya da oturumun sona erdi.',
  EMAIL_UNVERIFIED: 'Giriş yapmadan önce e-posta adresini doğrula.',
  INVALID_ACTION_TOKEN: 'Bu bağlantının süresi dolmuş veya bağlantı kullanılmış. Yeni bağlantı iste.',
  VALIDATION_FAILED: 'Lütfen form alanlarını kontrol et.',
  RATE_LIMITED: 'Çok fazla deneme yaptın. Biraz bekleyip tekrar dene.',
  ACCESS_DENIED: 'Bu işlem tamamlanamadı. Sayfayı yenileyip tekrar dene.',
}

async function raw(path: string, method: 'GET' | 'POST', body?: unknown, signal?: AbortSignal, csrf?: string): Promise<unknown> {
  let response: Response
  const timeout = AbortSignal.timeout(15_000)
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method, credentials: 'include', signal: requestSignal,
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(csrf ? { 'X-XSRF-TOKEN': csrf } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError(0, 'NETWORK_ERROR', 'Bağlantı kurulamadı. Lütfen tekrar dene.')
  }
  const requestId = response.headers.get('X-Request-ID') ?? undefined
  if (response.status === 204 || (response.status === 202 && response.ok)) return undefined
  let text: string
  try { text = await response.text() } catch { throw new ApiError(0, 'NETWORK_ERROR', 'Yanıt alınamadı. Lütfen tekrar dene.') }
  let data: unknown
  try { data = text ? JSON.parse(text) : undefined } catch { data = undefined }
  if (!response.ok) {
    const code = isRecord(data) && typeof data.code === 'string' ? data.code : 'REQUEST_FAILED'
    const fields: Record<string, string> = {}
    if (isRecord(data) && isRecord(data.fieldErrors)) {
      for (const key of ['email', 'password', 'token']) {
        if (typeof data.fieldErrors[key] === 'string') fields[key] = key === 'email'
          ? 'Geçerli bir e-posta adresi yaz.' : key === 'password'
            ? 'Şifre en az 10 karakter, UTF-8 olarak en fazla 72 bayt olmalı.' : 'Geçerli bir bağlantı kullan.'
      }
    }
    const retry = Number(response.headers.get('Retry-After'))
    throw new ApiError(response.status, code, messages[code] ?? 'İşlem şu anda tamamlanamıyor. Lütfen tekrar dene.',
      requestId, fields, Number.isFinite(retry) && retry > 0 ? retry : undefined)
  }
  if (data === undefined) throw new ApiError(response.status, 'INVALID_RESPONSE', 'Beklenmeyen bir yanıt alındı.', requestId)
  return data
}

async function mutation(path: string, body?: unknown) {
  // Fetch on mutation so a cookie changed by another tab never leaves a cached CSRF token behind.
  const csrf = await raw('/api/auth/csrf', 'GET')
  if (!isRecord(csrf) || typeof csrf.token !== 'string') throw new ApiError(0, 'INVALID_RESPONSE', 'İşlem başlatılamadı.')
  return raw(path, 'POST', body, undefined, csrf.token)
}

let authTail: Promise<unknown> = Promise.resolve()
function authLock<T>(action: () => Promise<T>): Promise<T> {
  const next = authTail.catch(() => undefined).then(() => {
    // Web Locks also serialize cookie rotations across tabs on localhost/HTTPS.
    if (typeof navigator !== 'undefined' && navigator.locks) return navigator.locks.request('tanidikvar-auth', action)
    return action()
  })
  authTail = next
  return next
}

let refreshPromise: Promise<void> | undefined
let revision = 0
let sessionEpoch = 0
export function invalidateSession() { sessionEpoch++; revision++ }

async function refresh() {
  if (!refreshPromise) {
    refreshPromise = authLock(async () => {
      try {
        // Another tab may already have refreshed while this tab waited for the lock.
        await raw('/api/me', 'GET')
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error
        await mutation('/api/auth/refresh')
      }
      revision++
    }).catch(error => {
      invalidateSession()
      window.dispatchEvent(new CustomEvent('auth:expired', { detail: { unavailable: !(error instanceof ApiError) || error.status !== 401 } }))
      throw error
    }).finally(() => { refreshPromise = undefined })
  }
  return refreshPromise
}

export async function apiGet(path: string, signal?: AbortSignal): Promise<unknown> {
  const startedRevision = revision
  const epoch = sessionEpoch
  try { return await raw(path, 'GET', undefined, signal) }
  catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || path.startsWith('/api/auth/')) throw error
    if (epoch !== sessionEpoch) throw error
    if (startedRevision === revision) await refresh()
    if (signal?.aborted) throw signal.reason
    if (epoch !== sessionEpoch) throw error
    // Only one retry. A second 401 cannot trigger another refresh.
    try { return await raw(path, 'GET', undefined, signal) }
    catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) {
        invalidateSession(); window.dispatchEvent(new Event('auth:expired'))
      }
      throw retryError
    }
  }
}

export async function authPost(path: string, body?: unknown): Promise<unknown> {
  return authLock(async () => {
    const result = await mutation(path, body)
    if (['/api/auth/login', '/api/auth/logout', '/api/auth/reset-password'].includes(path)) {
      invalidateSession()
      window.dispatchEvent(new Event('auth:changed'))
    }
    return result
  })
}
