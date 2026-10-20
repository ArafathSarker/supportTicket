import { BrowserRouter } from 'react-router-dom'
import { SupportProvider, SupportRoutes } from '@/support-ticket'

const demoUsers = {
  superadmin: {
    id: 1,
    username: 'superadmin',
    role: 'super_admin' as const,
    companyName: null,
  },
  alpha_admin: {
    id: 2,
    username: 'alpha_admin',
    role: 'company_admin' as const,
    companyName: 'Alpha IoT Farms',
  },
  greenleaf_admin: {
    id: 3,
    username: 'greenleaf_admin',
    role: 'company_admin' as const,
    companyName: 'GreenLeaf Cold Chain',
  },
}

/** Demo shell. Select a seeded role with ?user=superadmin or ?user=alpha_admin. */
export function AppRoutes() {
  const username = new URLSearchParams(window.location.search).get('user') ?? 'alpha_admin'
  const user = demoUsers[username as keyof typeof demoUsers] ?? demoUsers.alpha_admin

  return (
    <BrowserRouter>
      <SupportProvider
        config={{
          apiBase: '/api',
          user,
          getAuthHeaders: () => ({ 'X-Demo-User': user.username }),
          branding: { title: 'IoT Support' },
        }}
      >
        <SupportRoutes />
      </SupportProvider>
    </BrowserRouter>
  )
}
