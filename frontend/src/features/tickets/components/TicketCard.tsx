import { Link } from 'react-router-dom'
import { CalendarDays, Paperclip, User } from 'lucide-react'
import { Badge, type Tone } from '@/components/ui'
import { LEVELS } from '../api'
import type { Ticket, TicketStatus } from '../types'

const statusTones: Record<TicketStatus, Tone> = {
  open: 'warning',
  in_progress: 'info',
  resolved: 'success',
  closed: 'neutral',
}

/** Compact ticket card for the /tickets list. */
export function TicketCard({ ticket }: { ticket: Ticket }) {
  const urgencyTone = (LEVELS.find((l) => l.value === ticket.urgency)?.tone ?? 'neutral') as Tone

  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{ticket.title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            #{ticket.id} · {ticket.company_name}
          </p>
        </div>
        <Badge tone={statusTones[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone={urgencyTone}>{ticket.urgency}</Badge>
        <Badge>{ticket.priority} priority</Badge>
        <Badge>{ticket.problem_category}</Badge>
        {ticket.attachment_count > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Paperclip size={12} /> {ticket.attachment_count}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1">
          <User size={12} /> {ticket.created_by_username ?? '—'}
        </span>
        <span className="inline-flex items-center gap-1">
          <CalendarDays size={12} /> {new Date(ticket.created_at).toLocaleString()}
        </span>
      </div>
    </Link>
  )
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge tone={statusTones[status]}>{status.replace('_', ' ')}</Badge>
}
