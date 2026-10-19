import { useCallback, useEffect, useMemo, useState } from 'react'
import { visitsApi } from './api'
import type { VisitingLog, VisitingLogInput } from './types'

interface VisitsState {
  count: number
  results: VisitingLog[]
  loading: boolean
  error: string | null
}

/** Paginated visiting logs, role-scoped server-side. */
export function useVisitingLogs(page: number, company: number | '') {
  const [state, setState] = useState<VisitsState>({ count: 0, results: [], loading: true, error: null })
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    visitsApi
      .list({ page, company })
      .then((data) => {
        if (!cancelled) setState({ count: data.count, results: data.results, loading: false, error: null })
      })
      .catch((err: Error) => {
        if (!cancelled) setState({ count: 0, results: [], loading: false, error: err.message })
      })
    return () => {
      cancelled = true
    }
  }, [page, company, tick])

  return { state, refresh }
}

/** Create an acknowledgement visit — super admin only. */
export function useCreateVisitingLog(onDone: () => void) {
  const [submitting, setSubmitting] = useState(false)

  const submit = useCallback(
    async (payload: VisitingLogInput) => {
      setSubmitting(true)
      try {
        await visitsApi.create(payload)
        onDone()
      } finally {
        setSubmitting(false)
      }
    },
    [onDone],
  )

  return { submit, submitting }
}

export type { VisitingLog, VisitingLogInput }

export const useVisitingLogHelpers = () => useMemo(() => ({ fmtDate: fmtDate }), [])

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
