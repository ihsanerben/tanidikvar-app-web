import { useSyncExternalStore } from 'react'
import { getSnapshot, subscribe, setUser, reload, logout } from './authStore'
export function useAuth() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot)
  return { ...snapshot, setUser, reload, logout }
}
