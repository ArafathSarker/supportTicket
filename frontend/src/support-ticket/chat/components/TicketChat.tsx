import { useEffect, useRef, useState } from 'react'
import { SendHorizonal, ShieldCheck } from 'lucide-react'
import { Button } from '../../ui'
import { useSupportConfig } from '../../context'
import { useTicketChat } from '../hooks'
import type { Role } from '../../types'

function StatusBar({ status }: { status: ReturnType<typeof useTicketChat>['status'] }) {
  if (status === 'open') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live
      </span>
    )
  }
  if (status === 'connecting') return <span className="text-xs text-slate-500">Connecting…</span>
  if (status === 'unauthorized') return <span className="text-xs text-red-500">Demo user is unavailable</span>
  return <span className="text-xs text-amber-600">Offline — messages send when connected</span>
}

/** Live support chat between the company user and the super admin for one ticket. */
export function TicketChat({ ticketId }: { ticketId: number }) {
  const { messages, status, send } = useTicketChat(ticketId)
  const { user } = useSupportConfig()
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const content = draft.trim()
    if (!content) return
    send(content)
    setDraft('')
  }

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Live chat</h3>
        <StatusBar status={status} />
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            No messages yet — say hello to the support team.
          </p>
        )}
        {messages.map((m) => {
          const mine = user?.id === m.sender
          const isStaff = m.sender_role === ('super_admin' satisfies Role)
          return (
            <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                {isStaff && <ShieldCheck size={12} className="text-brand-600" />}
                <span>{mine ? 'You' : m.sender_username}</span>
                <span>·</span>
                <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div
                className={`mt-1 max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {m.content}
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={onSubmit} className="flex items-center gap-2 border-t border-slate-200 p-3">
        <input
          className="flex-1 rounded-lg border-0 px-3 py-2 text-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
          placeholder="Type a message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button type="submit" aria-label="Send message" disabled={status !== 'open' || !draft.trim()}>
          <SendHorizonal size={16} />
        </Button>
      </form>
    </div>
  )
}
