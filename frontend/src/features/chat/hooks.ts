import { useCallback, useEffect, useRef, useState } from 'react'
import { WS_BASE } from '@/lib/config'
import { getToken } from '@/lib/storage'
import { apiRequest } from '@/lib/api'
import type { TicketMessage } from '../tickets/types'

export type ChatStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error' | 'unauthorized'

/**
 * Ticket chat over Django Channels:
 * 1. loads history via REST
 * 2. opens /ws/tickets/<id>/chat/?token=<jwt>
 * 3. streams + sends live messages
 */
export function useTicketChat(ticketId: number | null) {
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>(ticketId ? 'connecting' : 'idle')
  const socketRef = useRef<WebSocket | null>(null)

  // history
  useEffect(() => {
    if (!ticketId) return
    let cancelled = false
    apiRequest<TicketMessage[]>(`/api/tickets/${ticketId}/messages/`)
      .then((history) => {
        if (!cancelled) setMessages(history)
      })
      .catch(() => {
        if (!cancelled) setMessages([])
      })
    return () => {
      cancelled = true
    }
  }, [ticketId])

  // websocket
  useEffect(() => {
    if (!ticketId) return
    const token = getToken()
    if (!token) {
      const timer = setTimeout(() => setStatus('unauthorized'), 0)
      return () => clearTimeout(timer)
    }

    let closedByUs = false
    const ws = new WebSocket(`${WS_BASE}/ws/tickets/${ticketId}/chat/?token=${token}`)
    socketRef.current = ws

    ws.onopen = () => setStatus('open')
    ws.onclose = ({ code }) => {
      setStatus(closedByUs ? 'closed' : code === 4401 ? 'unauthorized' : 'error')
    }
    ws.onerror = () => setStatus('error')
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as { type?: string; message?: TicketMessage }
        const incoming = data.message
        if (!incoming) return
        setMessages((prev) =>
          prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
        )
      } catch {
        /* ignore malformed frames */
      }
    }

    return () => {
      closedByUs = true
      ws.close()
      socketRef.current = null
    }
  }, [ticketId])

  const send = useCallback((content: string) => {
    const ws = socketRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ message: content }))
  }, [])

  return { messages, status, send }
}
