import { useEffect, type ReactNode } from 'react'
import { observeSession } from './authStore'
export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(observeSession, [])
  return children
}
