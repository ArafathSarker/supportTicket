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
  return <VisitingReportList role={resolved} />
}
