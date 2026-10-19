import { getToken } from './storage'

/** Assumed DRF error payload shape. */
export interface FieldErrors {
  [field: string]: string | string[]
}

export class ApiError extends Error {
  status: number
  errors?: FieldErrors

  constructor(status: number, message: string, errors?: FieldErrors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

type Query = Record<string, string | number | undefined | null>

/** Build a querystring, skipping empty values. */
export function makeQuery(query?: Query): string {
  if (!query) return ''
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value))
    }
  }
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

async function refreshSession(): Promise<boolean> {
  const refresh = localStorage.getItem('st_refresh_token')
  if (!refresh) return false
  const res = await fetch('/api/accounts/auth/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })
  if (!res.ok) return false
  const data = (await res.json()) as { access: string }
  localStorage.setItem('st_access_token', data.access)
  return true
}

/** Small typed wrapper around fetch with auth + JSON + error handling. */
export async function apiRequest<T>(
  path: string,
  options: RequestInit & { query?: Query; asForm?: boolean } = {},
): Promise<T> {
  const { query, asForm, headers, ...rest } = options
  const url = `${path}${makeQuery(query)}`

  const doFetch = async (token: string | null): Promise<Response> => {
    const authHeaders: Record<string, string> = { ...(headers as Record<string, string>) }
    if (!asForm && rest.body && typeof rest.body === 'string') {
      authHeaders['Content-Type'] = 'application/json'
    }
    if (token) {
      authHeaders['Authorization'] = `Bearer ${token}`
    }
    return fetch(url, {
      ...rest,
      headers: authHeaders,
    })
  }

  let res = await doFetch(getToken())

  if (res.status === 401 && !url.includes('/auth/')) {
    const renewed = await refreshSession()
    if (renewed) {
      res = await doFetch(getToken())
    }
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
          message = Object.entries(errors).map(([k, v]) => `${k}: ${v}`).join(', ')
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

/** DRF PageNumberPagination payload. */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export function paged<T>(data: Paginated<T>): Paginated<T> {
  return {
    count: data.count ?? 0,
    next: data.next,
    previous: data.previous,
    results: data.results ?? [],
  }
}
