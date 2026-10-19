import { useCallback, useState } from 'react'
import { authApi } from './api'
import { getStoredUser } from '@/lib/storage'
import type { AuthUser } from '@/types/auth'

/** Session singleton — user stored at login, invalidated on logout. */
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(getStoredUser())

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
    initializing: false,
    login,
    logout,
    isSuperAdmin: user?.role === 'super_admin',
  }
}
