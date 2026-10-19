import { VisitingReportList } from '../components/VisitingReportList'
import { useAuth } from '@/features/auth'

/**
 * /visiting-report — role-aware visiting reports.
 * Role is passed from the session and percolated as a prop (per spec).
 */
export function VisitingReportPage() {
  const { isSuperAdmin } = useAuth()
  return (
    <VisitingReportList role={isSuperAdmin ? 'super_admin' : 'company_admin'} />
  )
}
