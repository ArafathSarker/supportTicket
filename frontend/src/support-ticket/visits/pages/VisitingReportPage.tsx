import { useSupportConfig } from '../../context'
import { VisitingReportList } from '../components/VisitingReportList'
import type { Role } from '../../types'

/**
 * Visiting-report screen — role-aware visiting reports.
 * Role is passed from the host session as a prop (per the component contract);
 * when omitted it falls back to the configured user's role.
 */
export function VisitingReportPage({ role }: { role?: Role }) {
  const { user } = useSupportConfig()
  const resolved: Role = role ?? user?.role ?? 'company_admin'
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visiting Reports</h1>
        <p className="mt-1 text-sm text-slate-600">
          {resolved === 'super_admin' ? 'All acknowledgement visits logged' : 'Acknowledgements sent by the support team'}
        </p>
      </div>
      <VisitingReportList role={resolved} />
    </div>
  )
}
