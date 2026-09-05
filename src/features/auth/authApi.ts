import { apiGet, authPost, ApiError, isRecord } from '../../api/apiClient'

export interface CurrentUser { id: string; email: string; role: string; profileCompleted: boolean }
function user(value: unknown): CurrentUser {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.email !== 'string'
    || typeof value.role !== 'string' || typeof value.profileCompleted !== 'boolean') {
    throw new ApiError(200, 'INVALID_RESPONSE', 'Hesap bilgileri alınamadı.')
  }
  return { id: value.id, email: value.email, role: value.role, profileCompleted: value.profileCompleted }
}
export async function currentUser() { return user(await apiGet('/api/me')) }
export async function login(email: string, password: string) { return user(await authPost('/api/auth/login', { email, password })) }
export async function logout() { await authPost('/api/auth/logout') }
export async function register(email: string, password: string) { await authPost('/api/auth/register', { email, password }) }
export async function requestMail(email: string, purpose: 'verification' | 'password') {
  await authPost(purpose === 'verification' ? '/api/auth/resend-verification' : '/api/auth/forgot-password', { email })
}
export async function verifyEmail(token: string) { await authPost('/api/auth/verify-email', { token }) }
export async function resetPassword(token: string, password: string) { await authPost('/api/auth/reset-password', { token, password }) }
