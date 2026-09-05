const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly requestId?: string

  constructor(status: number, code: string, message: string, requestId?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// Foundation exposes read-only calls. JWT refresh/mutation CSRF handling follows with authentication.
export async function apiGet(path: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'GET', credentials: 'include', headers: { Accept: 'application/json' }, signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new ApiError(0, 'NETWORK_ERROR', 'Bağlantı kurulamadı. Lütfen tekrar dene.')
  }
  const requestId = response.headers.get('X-Request-ID') ?? undefined
  if (response.status === 204) return undefined
  const text = await response.text()
  let data: unknown
  try { data = text ? JSON.parse(text) : undefined } catch { data = undefined }
  if (!response.ok) {
    const code = isRecord(data) && typeof data.code === 'string' ? data.code : 'REQUEST_FAILED'
    // Render our safe message rather than arbitrary gateway/server text.
    throw new ApiError(response.status, code, 'İşlem şu anda tamamlanamıyor. Lütfen tekrar dene.', requestId)
  }
  if (data === undefined) throw new ApiError(response.status, 'INVALID_RESPONSE', 'Beklenmeyen bir yanıt alındı.', requestId)
  return data
}
