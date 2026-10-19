import { useState } from 'react'
import { Search } from 'lucide-react'
import { Empty, Loading, Pagination } from '@/components/ui'
import { LEVELS } from '../api'
import { useTickets } from '../hooks'
import type { TicketStatus, Urgency } from '../types'
import { TicketCard } from './TicketCard'
import { PAGE_SIZE } from '@/lib/pagination'

export interface TicketListProps {
  /** Accent for the "New ticket" CTA — set to null to hide the form opening button. */
  title?: string
}

const statusOptions: { value: TicketStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const levelOptions = [{ value: '' as Urgency | '', label: 'All levels' }, ...LEVELS.map((l) => ({ value: l.value, label: l.label }))]

/** Paginated, filterable ticket list. Same screen serves company admin & super admin. */
export function TicketList({ title = 'Tickets' }: TicketListProps) {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [urgency, setUrgency] = useState<Urgency | ''>('')
  const [search, setSearch] = useState('')

  const { tickets } = useTickets({ status, urgency, search }, page)
  const { loading, error, count, results } = tickets

  const onPage = (next: number) => {
    setPage(next)
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500">{count} ticket{count === 1 ? '' : 's'} total</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              className="w-56 rounded-lg border-0 bg-white py-2 pl-8 pr-3 text-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600"
              placeholder="Search tickets…"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
            />
          </label>
          <select
            className="rounded-lg bg-white px-2.5 py-2 text-sm ring-1 ring-inset ring-slate-300"
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value as TicketStatus | '')
            }}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            className="rounded-lg bg-white px-2.5 py-2 text-sm ring-1 ring-inset ring-slate-300"
            value={urgency}
            onChange={(e) => {
              setPage(1)
              setUrgency(e.target.value as Urgency | '')
            }}
          >
            {levelOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label} urgency</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <Loading />}
      {!loading && error && (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
      )}
      {!loading && !error && results.length === 0 && (
        <Empty title="No tickets found">Change the filters or create a new ticket.</Empty>
      )}
      {!loading && results.length > 0 && (
        <div className="space-y-3">
          {results.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      <div className="mt-6">
        {count > PAGE_SIZE && (
          <Pagination page={page} pageSize={PAGE_SIZE} count={count} onPage={onPage} />
        )}
      </div>
    </section>
  )
}
