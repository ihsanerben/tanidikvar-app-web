import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiGet, ApiError } from './apiClient'

afterEach(() => vi.unstubAllGlobals())
describe('API client', () => {
  it('sends credentials and returns JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'ok' })))
    vi.stubGlobal('fetch', fetchMock)
    expect(await apiGet('/api/health')).toEqual({ status: 'ok' })
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/health'), expect.objectContaining({ credentials: 'include', method: 'GET' }))
  })
  it('keeps machine error and request ID without exposing server details', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ code: 'SERVICE_UNAVAILABLE', message: 'private database credentials' }), { status: 503, headers: { 'X-Request-ID': 'request-123' } })))
    await expect(apiGet('/api/health')).rejects.toMatchObject({ status: 503, code: 'SERVICE_UNAVAILABLE', requestId: 'request-123' })
  })
  it('handles non-JSON gateway failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 })))
    await expect(apiGet('/api/health')).rejects.toMatchObject({ status: 502, code: 'REQUEST_FAILED' })
  })
  it('rejects malformed success responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json')))
    await expect(apiGet('/api/health')).rejects.toBeInstanceOf(ApiError)
  })
  it('turns network failures into a safe error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    await expect(apiGet('/api/health')).rejects.toMatchObject({ status: 0, code: 'NETWORK_ERROR' })
  })
})
