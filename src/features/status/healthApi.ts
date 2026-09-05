import { apiGet, ApiError } from '../../api/apiClient'

export type Health = { status: 'ok'; database: 'up' }

export async function getHealth(signal?: AbortSignal): Promise<Health> {
  const data = await apiGet('/api/health', signal)
  if (typeof data !== 'object' || data === null || !('status' in data) || !('database' in data)
    || data.status !== 'ok' || data.database !== 'up') {
    throw new ApiError(200, 'INVALID_RESPONSE', 'Hizmet durumu doğrulanamadı.')
  }
  return { status: 'ok', database: 'up' }
}
