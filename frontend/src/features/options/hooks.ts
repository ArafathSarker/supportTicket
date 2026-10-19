import { useEffect, useState } from 'react'
import { apiRequest } from '@/lib/api'
import type { OptionsMap } from './types'

export const optionsApi = {
  fetch: () => apiRequest<OptionsMap>('/api/options/'),
}

/** Loads dynamic dropdown options (affected systems, categories, checklist). */
export function useOptions() {
  const [options, setOptions] = useState<OptionsMap>({ system: [], category: [], work_performed: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    optionsApi
      .fetch()
      .then((data) => {
        if (!cancelled) setOptions(data)
      })
      .catch(() => {
        /* fall back to empty lists; error surfaced by callers if needed */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { options, loading }
}
