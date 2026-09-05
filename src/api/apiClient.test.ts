import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiGet, apiPublicPost, invalidateSession, ApiError } from './apiClient'

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

it('keeps public events during session changes, with CSRF and no automatic retry',async()=>{
 const fetch=vi.fn(async(url:string)=>url.endsWith('/csrf')?new Response(JSON.stringify({token:'csrf'})):new Response(null,{status:204}))
 vi.stubGlobal('fetch',fetch)
 const sent=apiPublicPost('/api/questions/question/views',{openingEventId:'opening'})
 invalidateSession()
 await expect(sent).resolves.toBeUndefined()
 expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/views'),expect.objectContaining({method:'POST',credentials:'include',headers:expect.objectContaining({'X-XSRF-TOKEN':'csrf'})}))
 fetch.mockImplementation(async(url:string)=>{if(url.endsWith('/csrf'))return new Response(JSON.stringify({token:'csrf'}));throw new TypeError('unknown result')})
 await expect(apiPublicPost('/api/questions/question/views',{openingEventId:'opening'})).rejects.toMatchObject({code:'NETWORK_ERROR'})
 expect(fetch.mock.calls.filter(([url])=>url.endsWith('/views'))).toHaveLength(2)
})
