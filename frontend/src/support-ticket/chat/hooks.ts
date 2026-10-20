import { useCallback, useEffect, useRef, useState } from 'react'

import { supportRequest } from '../client'
import { useSupportConfig } from '../context'
import type { SupportConfig, TicketMessage } from '../types'

export type ChatStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error' | 'unauthorized'

/**
 * Ticket chat over Django Channels:
 * 1. loads history via REST
 * 2. opens /ws/tickets/<id>/chat/?user=<seeded-user>
 * 3. streams + sends live messages
 */
export function useTicketChat(ticketId: number | null) {
  const config = useSupportConfig()
  const { wsBase } = config

  // The effect reads the freshest config without re-connecting on every render.
  const configRef = useRef<SupportConfig>(config)
  useEffect(() => {
    configRef.current = config
  })

  const userId = config.user?.id
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [status, setStatus] = useState<ChatStatus>(ticketId ? 'connecting' : 'idle')
  const socketRef = useRef<WebSocket | null>(null)

  // history
  useEffect(() => {
    if (!ticketId) return
    let cancelled = false
    supportRequest
      .request<TicketMessage[]>(`/tickets/${ticketId}/messages/`)
      .then((history) => {
        if (!cancelled) setMessages(history)
      })
      .catch(() => {
        if (!cancelled) setMessages([])
      })
    return () => {
      cancelled = true
    }
  }, [ticketId, userId])

  // websocket
  useEffect(() => {
    if (!ticketId || !wsBase) return

    let closedByUs = false
    const username = configRef.current.user?.username ?? 'superadmin'
    const ws = new WebSocket(
      `${wsBase}/ws/tickets/${ticketId}/chat/?user=${encodeURIComponent(username)}`,
    )
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
  }, [ticketId, wsBase, userId])

  const send = useCallback((content: string) => {
    const ws = socketRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ message: content }))
  }, [])

  return { messages, status, send }
}
