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

const DEMO_USER_KEY = 'support-ticket-demo-user'
type DemoUsername = keyof typeof demoUsers

function getDemoUsername(): DemoUsername {
  const fromUrl = new URLSearchParams(window.location.search).get('user')
  if (fromUrl && fromUrl in demoUsers) {
    const username = fromUrl as DemoUsername
    localStorage.setItem(DEMO_USER_KEY, username)
    return username
  }

  const stored = localStorage.getItem(DEMO_USER_KEY)
  if (stored && stored in demoUsers) return stored as DemoUsername

  const defaultUsername: DemoUsername = 'alpha_admin'
  localStorage.setItem(DEMO_USER_KEY, defaultUsername)
  return defaultUsername
}

/** Demo shell. The selected seeded user survives page refreshes. */
export function AppRoutes() {
  const username = getDemoUsername()
  const user = demoUsers[username]

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
