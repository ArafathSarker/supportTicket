import { BrowserRouter } from 'react-router-dom'
import { SupportProvider, SupportRoutes } from '@/support-ticket'

/** Demo shell using the seeded super-admin identity without login. */
export function AppRoutes() {
  return (
    <BrowserRouter>
      <SupportProvider
        config={{
          apiBase: '/api',
          user: {
            id: 1,
            username: 'superadmin',
            role: 'super_admin',
            companyName: null,
          },
          getAuthHeaders: () => ({ 'X-Demo-User': 'superadmin' }),
          branding: { title: 'IoT Support' },
        }}
      >
        <SupportRoutes />
      </SupportProvider>
    </BrowserRouter>
  )
}
