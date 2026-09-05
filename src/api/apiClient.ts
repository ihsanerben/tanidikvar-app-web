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
  INVALID_FILE: 'Belge PDF ve en fazla 10 MB; fotoğraf JPEG/PNG ve en fazla 5 MB (16 milyon piksel) olmalı.',
  APPLICATION_INELIGIBLE: 'Başvuru için üniversite öğrencisi veya mezun profilini tamamla.',
  APPLICATION_PENDING: 'Zaten inceleme bekleyen bir başvurun var.',
  REASON_REQUIRED: 'Gerekçe yaz (en fazla 1000 karakter).',
  STORAGE_UNAVAILABLE: 'Dosyaya şu anda erişilemiyor. Tekrar dene.',
  AUTHENTICATION_REQUIRED: 'E-posta veya şifre hatalı ya da oturumun sona erdi.',
  EMAIL_UNVERIFIED: 'Giriş yapmadan önce e-posta adresini doğrula.',
  INVALID_ACTION_TOKEN: 'Bu bağlantının süresi dolmuş veya bağlantı kullanılmış. Yeni bağlantı iste.',
  VALIDATION_FAILED: 'Lütfen form alanlarını kontrol et.',
  RATE_LIMITED: 'Çok fazla deneme yaptın. Biraz bekleyip tekrar dene.',
  PROFILE_REQUIRED: 'Bu işlem için profilini tamamla.',
  STALE_VERSION: 'Bu kayıt başka bir ekranda değişmiş. Güncel bilgileri yükleyip tekrar dene.',
  CATALOG_CONFLICT: 'Bu kayıt zaten var. Pasif kayıtları da kontrol et.',
  INACTIVE_EDUCATION: 'Bu üniversite/bölüm yeni seçimlere kapalı. Aktif bir eşleşme seç.',
  REQUEST_CONFLICT: 'Bu gönderim daha önce kaydedilmiş. Sorularım sayfasından kontrol et.',
  QUESTION_ARCHIVED: 'Arşivlenmiş soru yeni cevap, düzenleme veya geri yüklemeye kapalı.',
  ANSWER_EXISTS: 'Bu soruya zaten cevap verdin. Mevcut cevabını düzenle.',
  ANSWER_REMOVED: 'Bu sorudaki cevabını kaldırmışsın. Yeni kayıt yerine aynı cevabı geri yükleyebilirsin.',
  INACTIVE_CATALOG: 'Bu kayıt artık yeni seçimlere açık değil.',
  INVALID_REQUEST: 'Seçimlerini kontrol edip tekrar dene.',
  NOT_FOUND: 'Kayıt bulunamadı.',
  ACCESS_DENIED: 'Bu işlem tamamlanamadı. Sayfayı yenileyip tekrar dene.',
}

async function raw(path: string, method: 'GET' | 'POST' | 'PUT', body?: unknown, signal?: AbortSignal, csrf?: string, binary=false): Promise<unknown> {
  let response: Response
  const timeout = AbortSignal.timeout(15_000)
  const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method, credentials: 'include', signal: requestSignal,
      headers: { Accept: binary?'application/octet-stream':'application/json', ...(body !== undefined && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...(csrf ? { 'X-XSRF-TOKEN': csrf } : {}) },
      ...(body !== undefined ? { body: body instanceof FormData?body:JSON.stringify(body) } : {}),
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError(0, 'NETWORK_ERROR', 'Bağlantı kurulamadı. Lütfen tekrar dene.')
  }
  const requestId = response.headers.get('X-Request-ID') ?? undefined
  if (binary && response.ok) return response.blob()
  if (response.status === 204 || (response.status === 202 && response.ok)) return undefined
  let text: string
  try { text = await response.text() } catch { throw new ApiError(0, 'NETWORK_ERROR', 'Yanıt alınamadı. Lütfen tekrar dene.') }
  let data: unknown
  try { data = text ? JSON.parse(text) : undefined } catch { data = undefined }
  if (!response.ok) {
    const code = isRecord(data) && typeof data.code === 'string' ? data.code : 'REQUEST_FAILED'
    const fields: Record<string, string> = {}
    if (isRecord(data) && isRecord(data.fieldErrors)) {
      const fieldMessages: Record<string,string> = {
        email: 'Geçerli bir e-posta adresi yaz.', password: 'Şifre en az 10 karakter, UTF-8 olarak en fazla 72 bayt olmalı.', token: 'Geçerli bir bağlantı kullan.',
        firstName: 'Adını yaz (en fazla 80 karakter).', lastName: 'Soyadını yaz (en fazla 80 karakter).', educationStatus: 'Eğitim durumunu seç.',
        universityDepartmentId: 'Durumuna uygun, aktif bir üniversite/bölüm seç.', graduationYear: 'Geçerli bir mezuniyet yılı yaz.',
        biography: 'Biyografi en fazla 1000 karakter olabilir.', occupation: 'Meslek en fazla 120 karakter olabilir.', company: 'Şirket en fazla 120 karakter olabilir.',
        title: 'Soru başlığı 10–200 karakter olmalı.', body: path.includes('/answers')?'Cevap 10–5000 karakter olmalı.':'Açıklama en fazla 5000 karakter olabilir.', scope: 'Kapsama uygun üniversite ve bölüm seç.', tagIds: 'En fazla 5 farklı tag seç.', universityId: 'Aktif bir üniversite seç.',
        name: 'Ad 1–200 karakter olmalı.', version: 'Güncel kaydı yükleyip tekrar dene.',
      }
      for (const [key,message] of Object.entries(fieldMessages)) if(typeof data.fieldErrors[key] === 'string' || typeof data.fieldErrors[`content.${key}`] === 'string') fields[key]=message
    }
    const retry = Number(response.headers.get('Retry-After'))
    throw new ApiError(response.status, code, messages[code] ?? 'İşlem şu anda tamamlanamıyor. Lütfen tekrar dene.',
      requestId, fields, Number.isFinite(retry) && retry > 0 ? retry : undefined)
  }
  if (data === undefined) throw new ApiError(response.status, 'INVALID_RESPONSE', 'Beklenmeyen bir yanıt alındı.', requestId)
  return data
}

async function mutation(path: string, body?: unknown, method: 'POST' | 'PUT' = 'POST') {
  // Fetch on mutation so a cookie changed by another tab never leaves a cached CSRF token behind.
  const csrf = await raw('/api/auth/csrf', 'GET')
  if (!isRecord(csrf) || typeof csrf.token !== 'string') throw new ApiError(0, 'INVALID_RESPONSE', 'İşlem başlatılamadı.')
  return raw(path, method, body, undefined, csrf.token)
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

export async function apiGet(path: string, signal?: AbortSignal, binary=false): Promise<unknown> {
  const startedRevision = revision
  const epoch = sessionEpoch
  try { return await raw(path, 'GET', undefined, signal, undefined, binary) }
  catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401 || path.startsWith('/api/auth/')) throw error
    if (epoch !== sessionEpoch) throw error
    if (startedRevision === revision) await refresh()
    if (signal?.aborted) throw signal.reason
    if (epoch !== sessionEpoch) throw error
    // Only one retry. A second 401 cannot trigger another refresh.
    try { return await raw(path, 'GET', undefined, signal, undefined, binary) }
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

// Business mutations retry only a rejected 401, never a network error or a successful write.
export async function apiMutation(path: string, method: 'POST' | 'PUT', body: unknown): Promise<unknown> {
  const epoch = sessionEpoch
  const startedRevision = revision
  const send = () => authLock(async () => {
    if (epoch !== sessionEpoch) throw new ApiError(401, 'SESSION_CHANGED', 'Oturum değişti. Sayfayı yenile.')
    return mutation(path, body, method)
  })
  try { return await send() } catch(error) {
    if (!(error instanceof ApiError) || error.status !== 401 || epoch !== sessionEpoch) throw error
    if (startedRevision === revision) await refresh()
    if (epoch !== sessionEpoch) throw error
    try { return await send() } catch (retryError) {
      if (retryError instanceof ApiError && retryError.status === 401) {
        invalidateSession(); window.dispatchEvent(new Event('auth:expired'))
      }
      throw retryError
    }
  }
}
