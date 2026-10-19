import { useCallback, useEffect, useRef, useState } from 'react'
import { paged } from '@/lib/api'
import type { Paginated } from '@/lib/api'
import { ticketApi } from './api'
import type { Ticket, TicketFilters, TicketStatus } from './types'

interface TicketListState extends Paginated<Ticket> {
  loading: boolean
  error: string | null
}

function emptyState(): TicketListState {
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
    loading: true,
    error: null,
  }
}

/** Paginated ticket list, role-scoped server-side. Refetches when filters/page change. */
export function useTickets(filters: TicketFilters, page: number) {
  const [state, setState] = useState<TicketListState>(emptyState)
  const [tick, setTick] = useState(0)
  const firstLoad = useRef(true)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    const { status, urgency, priority, search } = filters
    firstLoad.current = false
    ticketApi
      .list({ page, status, urgency, priority, search })
      .then((data) => {
        if (!cancelled) setState({ ...data, loading: false, error: null })
      })
      .catch((err: Error) => {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: err.message }))
      })
    return () => {
      cancelled = true
    }
  }, [filters, page, tick])

  return { tickets: state, refresh }
}

export function useTicket(id: number | null) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    ticketApi
      .get(id)
      .then((t) => {
        if (!cancelled) {
          setTicket(t)
          setError(null)
          setLoading(false)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const updateStatus = useCallback(
    async (status: TicketStatus) => {
      if (!id) return
      await ticketApi.updateStatus(id, status)
      setTicket((t) => (t ? { ...t, status } : t))
    },
    [id],
  )

  return { ticket, loading, error, updateStatus }
}

/** One-shot create hook used by TicketForm. */
export function useCreateTicket(onDone: () => void) {
  const [submitting, setSubmitting] = useState(false)

  const submit = useCallback(
    async (payload: Parameters<typeof ticketApi.create>[0]) => {
      setSubmitting(true)
      try {
        await ticketApi.create(payload)
        onDone()
      } finally {
        setSubmitting(false)
      }
    },
    [onDone],
  )

  return { submit, submitting }
}

export { paged }
