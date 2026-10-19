import { apiRequest } from '@/lib/api'
import { clearSession, getToken, setSession } from '@/lib/storage'
import type { AuthUser } from '@/types/auth'

interface LoginResponse {
  access: string
  refresh: string
  user: AuthUser
}

export const authApi = {
  async login(username: string, password: string): Promise<AuthUser> {
    const data = await apiRequest<LoginResponse>('/api/accounts/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    setSession(data.access, data.refresh, data.user)
    return data.user
  },

  async me(): Promise<AuthUser> {
    return apiRequest<AuthUser>('/api/accounts/me/', { method: 'GET' })
  },

  logout() {
    clearSession()
  },

  isAuthenticated(): boolean {
    return Boolean(getToken())
  },
}
