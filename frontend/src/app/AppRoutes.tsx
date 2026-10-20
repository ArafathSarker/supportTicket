import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { SupportProvider, SupportRoutes } from '@/support-ticket'
import { LoginPage } from '@/auth/LoginPage'
import { clearSession, getStoredUser, getToken, type SessionUser } from '@/lib/session'

/**
 * Demo app shell: a login screen (host-owned) + the whole reusable
 * support-ticket component mounted with config + auth wiring in one place.
 */
export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* ★ the whole support-ticket component, wired with the demo session */}
        <Route path="*" element={<ProtectedSupport />} />
      </Routes>
    </BrowserRouter>
  )
}

function ProtectedSupport() {
  const user: SessionUser | null = getStoredUser()

  if (!user) return <Navigate to="/login" replace />

  return (
    <SupportProvider
      config={{
        apiBase: '/api',
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          companyName: user.company_name,
        },
        getAuthHeaders: () => ({ Authorization: `Bearer ${getToken()}` }),
        getAccessToken: getToken,
        onUnauthorized: () => {
          clearSession()
          window.location.assign('/login')
        },
        onLogout: () => clearSession(),
        loginPath: '/login',
        branding: { title: 'IoT Support' },
      }}
    >
      <SupportRoutes />
    </SupportProvider>
  )
}
