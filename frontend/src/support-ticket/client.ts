import { ApiError, makeQuery, paged, type FieldErrors } from './api'
import type { Paginated, SupportConfig } from './types'

type Query = Record<string, string | number | undefined | null>

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  query?: Query
  body?: string | FormData
  headers?: Record<string, string>
  /** Skip 401-retry callback (for the refresh request itself). */
  skipUnauthorized?: boolean
}

export interface Requester {
  /** Swap the active config (called by <SupportProvider>). */
  setConfig(config: SupportConfig): void
  /** Small typed wrapper around fetch with auth headers, JSON and DRF error parsing. */
  request<T>(path: string, options?: RequestOptions): Promise<T>
  paged: typeof paged
}

/** The live Requester singleton — wired to the active <SupportProvider> config. */
export const supportRequest = createRequest()

/** Returns the raw access token for the WebSocket auth, if the host provided one. */
export function getAccessTokenFromConfig(config: SupportConfig): string | null {
  if (config.getAccessToken) return config.getAccessToken()
  const auth = config.getAuthHeaders?.().Authorization
  return auth ? auth.replace(/^Bearer\s+/i, '') : null
}

const defaults = {
  apiBase: '/api',
}

export function createRequest(): Requester {
  let config: SupportConfig = { user: null }

  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', query, body, headers, skipUnauthorized } = options
    const url = `${config.apiBase ?? defaults.apiBase}${path}${makeQuery(query)}`

    const requestHeaders: Record<string, string> = { ...(config.getAuthHeaders?.() ?? {}), ...headers }
    if (body && typeof body === 'string') {
      requestHeaders['Content-Type'] = 'application/json'
    }

    const res = await fetch(url, { method, headers: requestHeaders, body })

    if (res.status === 401 && !skipUnauthorized) {
      const error = new ApiError(res.status, res.statusText || 'Unauthorized')
      config.onUnauthorized?.(error)
    }

    if (!res.ok) {
      let message = res.statusText || 'Request failed'
      let errors: FieldErrors | undefined
      try {
        const data = await res.json()
        if (typeof data === 'object' && data !== null) {
          if (typeof data.detail === 'string') message = data.detail
          else if (typeof data.detail === 'object') {
            message = 'Request failed'
            errors = data.detail as FieldErrors
          } else if (Object.keys(data).length) {
            errors = data as FieldErrors
            message = Object.entries(errors)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')
          }
        }
      } catch {
        /* non-JSON error body, keep statusText */
      }
      throw new ApiError(res.status, message, errors)
    }

    if (res.status === 204) return undefined as T
    return (await res.json()) as T
  }

  return {
    setConfig(next) {
      config = next
    },
    request,
    paged,
  }
}

export type { Paginated }
