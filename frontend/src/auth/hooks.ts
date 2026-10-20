import { useCallback, useState } from 'react'
import { authApi } from './api'
import { getStoredUser } from '@/lib/session'
import type { SessionUser } from '@/lib/session'

/** Session singleton for the demo shell — user stored at login, invalidated on logout. */
export function useAuth() {
  const [user, setUser] = useState<SessionUser | null>(getStoredUser())

  const login = useCallback(async (username: string, password: string) => {
    const next = await authApi.login(username, password)
    setUser(next)
    return next
  }, [])

  const logout = useCallback(() => {
    authApi.logout()
    setUser(null)
  }, [])

  return {
    user,
    login,
    logout,
    isSuperAdmin: user?.role === ('super_admin' as const),
  }
}
