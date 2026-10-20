import { Link } from 'react-router-dom'
import { CalendarDays, Paperclip, User } from 'lucide-react'
import { Badge, type Tone } from '../../ui'
import { LEVELS } from '../api'
import { useSupportRoutes } from '../../context'
import type { Ticket, TicketStatus } from '../../types'

const statusTones: Record<TicketStatus, Tone> = {
  open: 'warning',
  in_progress: 'info',
  resolved: 'success',
  closed: 'neutral',
}

/** Compact ticket card for the tickets list. */
export function TicketCard({ ticket }: { ticket: Ticket }) {
  const routes = useSupportRoutes()
  const urgencyTone = (LEVELS.find((l) => l.value === ticket.urgency)?.tone ?? 'neutral') as Tone

  return (
    <Link
      to={routes.ticketDetail(ticket.id)}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-brand-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-slate-900">{ticket.title}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            #{ticket.id} · {ticket.company_name}
          </p>
        </div>
        <Badge tone={statusTones[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone="neutral">{ticket.sensor_id}</Badge>
        <Badge tone="neutral">{ticket.factory_section}</Badge>
        <Badge tone={urgencyTone}>{ticket.urgency} urgency</Badge>
        <Badge>{ticket.priority} priority</Badge>
        <Badge tone="primary">{ticket.problem_category}</Badge>
        <Badge tone="neutral">{ticket.affected_system}</Badge>
        {ticket.attachment_count > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-500/20">
            <Paperclip size={12} /> {ticket.attachment_count}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <User size={12} /> {ticket.created_by_username ?? '—'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={12} /> {new Date(ticket.created_at).toLocaleString()}
        </span>
      </div>
    </Link>
  )
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge tone={statusTones[status]}>{status.replace('_', ' ')}</Badge>
}
