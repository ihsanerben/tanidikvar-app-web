import { ApiError, invalidateSession } from '../../api/apiClient'
import { currentUser, logout as logoutRequest, type CurrentUser } from './authApi'

type Status = 'loading' | 'ready' | 'error'
interface Snapshot { user: CurrentUser | null; status: Status }
let snapshot: Snapshot = { user: null, status: 'loading' }
const subscribers = new Set<() => void>()
let generation = 0
let pending: Promise<void> | undefined
function publish(value: Snapshot) { snapshot = value; subscribers.forEach(listener => listener()) }
export const getSnapshot = () => snapshot
export function subscribe(listener: () => void) { subscribers.add(listener); return () => { subscribers.delete(listener) } }
export function setUser(user: CurrentUser | null) { generation++; publish({ user, status: 'ready' }) }
export function reload() {
  if (pending) return pending
  const ticket = ++generation
  publish({ user: snapshot.user, status: 'loading' })
  pending = currentUser().then(user => {
    if (ticket === generation) publish({ user, status: 'ready' })
  }).catch(error => {
    if (ticket === generation) publish({ user: null, status: error instanceof ApiError && error.status === 401 ? 'ready' : 'error' })
  }).finally(() => { pending = undefined })
  return pending
}
export async function logout() {
  generation++; invalidateSession(); publish({ user: null, status: 'loading' })
  try { await logoutRequest(); publish({ user: null, status: 'ready' }) }
  catch (error) { publish({ user: null, status: 'error' }); throw error }
}
export function observeSession() {
  void reload()
  const expired = (event: Event) => {
    generation++
    publish({ user: null, status: event instanceof CustomEvent && event.detail?.unavailable ? 'error' : 'ready' })
  }
  const focus = () => { void reload() }
  window.addEventListener('auth:expired', expired); window.addEventListener('focus', focus)
  return () => { window.removeEventListener('auth:expired', expired); window.removeEventListener('focus', focus) }
}
