import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileVideo } from 'lucide-react'
import { Badge, Card, Loading, Select } from '../../ui'
import { TicketChat } from '../../chat'
import { useTicket } from '../hooks'
import { STATUS_META } from '../api'
import { supportRequest } from '../../client'
import { useSupportConfig, useSupportRoutes } from '../../context'
import type { Ticket, TicketAttachment, TicketStatus } from '../../types'

export function AttachmentsList({ ticketId }: { ticketId: number }) {
  const [attachments, setAttachments] = useState<TicketAttachment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supportRequest
      .request<TicketAttachment[] | { results?: TicketAttachment[] }>(`/tickets/${ticketId}/attachments/`)
      .then((data) => {
        if (!cancelled) setAttachments(Array.isArray(data) ? data : (data.results ?? []))
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
  const { user } = useSupportConfig()
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

  const isSuperAdmin = user?.role === 'super_admin'

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
  const routes = useSupportRoutes()
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
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <div className="space-y-6">
        <div>
          <Link to={routes.tickets} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft size={14} /> Back to tickets
          </Link>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{ticket.title}</h1>
              <p className="mt-1 text-sm text-slate-600">
                #{ticket.id} · {ticket.company_name} · reported by {ticket.created_by_username || '—'}
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Card className="bg-slate-50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Sensor ID / Asset Tag</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.sensor_id}</p>
              </Card>
              <Card className="bg-slate-50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Factory Section / Location</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{ticket.factory_section}</p>
              </Card>
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

        <Card padding={true}>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Ticket Details</h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
            <Detail label="Affected system" value={ticket.affected_system} />
            <Detail label="Problem category" value={ticket.problem_category} />
            <Detail label="Urgency / Priority" value={`${ticket.urgency} / ${ticket.priority}`} />
          </dl>
          <div className="mt-6 border-t border-slate-100 pt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Description</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{ticket.description}</p>
          </div>
        </Card>

        <Card padding={true}>
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Attachments</h2>
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
