import { useState } from 'react'
import { Badge, Card, Empty, Loading, Pagination } from '../../ui'
import { useVisitingLogs } from '../hooks'
import { PAGE_SIZE } from '../../constants'
import type { Role } from '../../types'

interface VisitingReportListProps {
  /** Role distinguishes the view (super admin sees manager details). */
  role: Role
}

/** Paginated visiting reports. Shows company for super admin, hides it for company users. */
export function VisitingReportList({ role }: VisitingReportListProps) {
  const [page, setPage] = useState(1)
  const { state } = useVisitingLogs(page, '')
  const { count, results, loading, error } = state

  if (loading) return <Loading label="Loading visiting reports…" />
  if (error) return <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>
  if (results.length === 0) {
    return <Empty title="No visiting reports yet">Reports from on-site visits will appear here.</Empty>
  }

  return (
    <section>
      <h1 className="mb-1 text-xl font-bold text-slate-900">Visiting reports</h1>
      <p className="mb-4 text-sm text-slate-500">
        {role === 'super_admin'
          ? 'All acknowledgement visits you logged'
          : 'Acknowledgements sent by the support team'}
      </p>

      <div className="space-y-3">
        {results.map((log) => (
          <Card key={log.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {log.company_name} — {new Date(log.visiting_date).toLocaleDateString()}
                </h3>
                {role === 'super_admin' ? (
                  <p className="mt-0.5 text-xs text-slate-500">Logged by {log.created_by_username}</p>
                ) : (
                  <p className="mt-0.5 text-xs text-slate-500">
                    Visited by the support team · {log.number_of_persons} person(s)
                  </p>
                )}
              </div>
              {log.ticket && (
                <Badge>
                  Ticket #{log.ticket} {log.ticket_title ? `· ${log.ticket_title}` : ''}
                </Badge>
              )}
            </div>

            <div className="mt-3 text-sm text-slate-700">
              <p className="whitespace-pre-wrap">{log.reason}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {log.work_performed.map((w) => (
                <Badge key={w} tone="success">
                  {w}
                </Badge>
              ))}
            </div>

            <div className="mt-3 grid gap-1 text-xs text-slate-500 sm:grid-cols-2">
              <p>Contacts: {log.responsible_phone_numbers}</p>
              <p>Persons: {log.number_of_persons}</p>
            </div>
          </Card>
        ))}
      </div>

      {count > PAGE_SIZE && (
        <div className="mt-6">
          <Pagination page={page} pageSize={PAGE_SIZE} count={count} onPage={setPage} />
        </div>
      )}
    </section>
  )
}
