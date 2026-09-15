import { ApiError } from '../../api/apiClient'
export function AuthFormError({ error }: { error: ApiError | null }) {
  if (!error) return null
  return <div className="form-error" role="alert" tabIndex={-1}>{error.message}
    {error.retryAfter && <p>Yaklaşık {error.retryAfter} saniye sonra tekrar deneyebilirsin.</p>}
  </div>
}
