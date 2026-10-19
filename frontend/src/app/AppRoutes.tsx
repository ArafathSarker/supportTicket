import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth, RequireRole } from '@/components/layout/RequireAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/features/auth'
import { TicketsPage, TicketDetailPage } from '@/features/tickets'
import { VisitingLogPage, VisitingReportPage } from '@/features/visits'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />

            {/* super admin only */}
            <Route
              path="/visiting-log"
              element={
                <RequireRole roles={['super_admin']}>
                  <VisitingLogPage />
                </RequireRole>
              }
            />

            {/* both roles; the role prop distinguishes the view */}
            <Route path="/visiting-report" element={<VisitingReportPage />} />

            <Route index element={<Navigate to="/tickets" replace />} />
            <Route path="*" element={<Navigate to="/tickets" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
