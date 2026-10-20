import { Navigate, Route, Routes } from 'react-router-dom'

import { useSupportConfig, useSupportRoutes, RequireRole } from './context'
import { SupportLayout } from './SupportLayout'
import { TicketDetailPage, TicketsPage } from './tickets'
import { VisitingLogPage, VisitingReportPage } from './visits'

/**
 * Ready-made route wiring for the support screens.
 *
 * The paths are relative, so hosts mount the whole component wherever they
 * like. A standalone host can place it directly inside its <Routes>:
 *
 *   <Routes>
 *     ...host routes...
 *     <Route path="/support/*" element={<SupportRoutes />} />
 *   </Routes>
 *
 * …and each screen is also available standalone (TicketsPage,
 * VisitingLogPage, VisitingReportPage, TicketDetailPage, TicketDetail…).
 */
export function SupportRoutes() {
  return (
    <Routes>
      <Route element={<SupportLayout />}>
        <Route path="tickets" element={<TicketsPage />} />
        <Route path="tickets/:id" element={<TicketDetailPage />} />

        {/* super admin only */}
        <Route
          path="visiting-log"
          element={
            <RequireRole roles={['super_admin']}>
              <VisitingLogPage />
            </RequireRole>
          }
        />

        {/* both roles; the role prop distinguishes the view */}
        <Route path="visiting-report" element={<VisitingReportPage />} />

        <Route path="*" element={<RedirectToTickets />} />
      </Route>
    </Routes>
  )
}

function RedirectToTickets() {
  const routes = useSupportRoutes()
  const { basePath = '' } = useSupportConfig()
  return <Navigate to={basePath ? routes.tickets : 'tickets'} replace />
}
