import { getToken, setSession, clearSession, type SessionUser } from '@/lib/session'

interface LoginResponse {
  access: string
  refresh: string
  user: SessionUser
}

export const authApi = {
  /** Demo login against this project's accounts endpoints; the component
   * itself never sees localStorage — the host passes it via SupportConfig. */
  async login(username: string, password: string): Promise<SessionUser> {
    const res = await fetch('/api/accounts/auth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const detail = await res.json().catch(() => null)
      throw new Error(detail?.detail ?? 'Login failed')
    }
    const data = (await res.json()) as LoginResponse
    setSession(data.access, data.refresh, data.user)
    return data.user
  },

  logout() {
    clearSession()
  },

  isAuthenticated(): boolean {
    return Boolean(getToken())
  },
}
