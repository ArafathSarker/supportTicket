/** Demo session storage (host-side). The support-ticket component reads
 * auth through SupportConfig callbacks, never from here directly. */

import type { Role } from '../support-ticket'

export interface SessionUser {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role: Role
  company: number | null
  company_name: string | null
}

const TOKEN_KEY = 'st_access_token'
const REFRESH_KEY = 'st_refresh_token'
const USER_KEY = 'st_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(access: string, refresh: string, user: SessionUser) {
  localStorage.setItem(TOKEN_KEY, access)
  localStorage.setItem(REFRESH_KEY, refresh)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as SessionUser) : null
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}
