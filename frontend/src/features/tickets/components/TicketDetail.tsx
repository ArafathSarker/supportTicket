import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileVideo } from 'lucide-react'
import { Badge, Card, Loading, Select } from '@/components/ui'
import { useAuth } from '@/features/auth'
import { TicketChat } from '@/features/chat'
import { useTicket } from '../hooks'
import { STATUS_META } from '../api'
import type { Ticket, TicketAttachment, TicketStatus } from '../types'
import { apiRequest } from '@/lib/api'
import type { Paginated } from '@/lib/api'

function AttachmentsList({ ticketId }: { ticketId: number }) {
  const [attachments, setAttachments] = useState<TicketAttachment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    apiRequest<Paginated<TicketAttachment>>(`/api/tickets/${ticketId}/attachments/`)
      .then((data) => {
        if (!cancelled) setAttachments(data.results ?? (data as unknown as TicketAttachment[]))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [ticketId])

  if (loading) return <Loading label="Loading attachments…" className="py-6" />
  if (!attachments.length) return <p className="text-sm text-slate-500">No attachments.</p>

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {attachments.map((att) => (
        <a
          key={att.id}
          href={att.file_url ?? att.file}
          target="_blank"
          rel="noreferrer"
          className="group relative flex h-32 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
        >
          {att.file_type === 'image' ? (
            <img
              src={att.file_url ?? att.file}
              alt="attachment"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <span className="flex flex-col items-center gap-1 text-slate-500">
              <FileVideo size={28} />
              <span className="text-xs uppercase">{att.file_type}</span>
            </span>
          )}
        </a>
      ))}
    </div>
  )
}

/** Full ticket page: meta, attachments, live chat, admin status control. */
export function TicketDetail({ ticketId }: { ticketId: number }) {
  const { isSuperAdmin } = useAuth()
  const { ticket, loading, error, updateStatus } = useTicket(ticketId)

  if (loading) return <Loading />
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 text-sm text-red-700">
        Failed to load ticket: {error}
      </Card>
    )
  }
  if (!ticket) return null

  return <LoadedTicket ticket={ticket} isSuperAdmin={isSuperAdmin} updateStatus={updateStatus} />
}

function LoadedTicket({
  ticket,
  isSuperAdmin,
  updateStatus,
}: {
  ticket: Ticket
  isSuperAdmin: boolean
  updateStatus: (status: TicketStatus) => Promise<void>
}) {
  const [saving, setSaving] = useState(false)

  const onStatusChange = async (status: TicketStatus) => {
    setSaving(true)
    try {
      await updateStatus(status)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div>
          <Link to="/tickets" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft size={14} /> Back to tickets
          </Link>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{ticket.title}</h1>
              <p className="text-sm text-slate-500">
                #{ticket.id} · {ticket.company_name} · reported by {ticket.created_by_username || '—'}
              </p>
            </div>
            {isSuperAdmin ? (
              <div className="w-44">
                <Select
                  id="ticket-status"
                  label="Status"
                  className="[&_select]:mb-0"
                  options={Object.entries(STATUS_META).map(([value, meta]) => ({ value, label: meta.label }))}
                  value={ticket.status}
                  disabled={saving}
                  onChange={(e) => onStatusChange(e.target.value as TicketStatus)}
                />
              </div>
            ) : (
              <Badge tone={STATUS_META[ticket.status].tone}>{STATUS_META[ticket.status].label}</Badge>
            )}
          </div>
        </div>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Details</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <Detail label="Affected system" value={ticket.affected_system} />
            <Detail label="Category" value={ticket.problem_category} />
            <Detail label="Urgency / priority" value={`${ticket.urgency} / ${ticket.priority}`} />
          </dl>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{ticket.description}</p>
          </div>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Attachments</h2>
          <AttachmentsList ticketId={ticket.id} />
        </Card>
      </div>

      <TicketChat ticketId={ticket.id} />
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 capitalize text-slate-700">{value}</dd>
    </div>
  )
}
