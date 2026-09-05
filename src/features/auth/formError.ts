import { ApiError } from '../../api/apiClient'
export function formError(error: unknown) {
  return error instanceof ApiError ? error : new ApiError(0, 'UNKNOWN', 'İşlem tamamlanamadı. Lütfen tekrar dene.')
}
