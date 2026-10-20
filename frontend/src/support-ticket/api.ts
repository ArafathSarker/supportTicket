import type { Paginated } from './types'

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

/** DRF PageNumberPagination payload normalizer. */
export function paged<T>(data: Paginated<T>): Paginated<T> {
  return {
    count: data.count ?? 0,
    next: data.next,
    previous: data.previous,
    results: data.results ?? [],
  }
}
