import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LifeBuoy, LogOut, ScrollText, Ticket } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks'
import type { Role } from '@/types/auth'

interface NavItem {
  to: string
  label: string
  icon: typeof Ticket
  roles?: Role[]
}

const NAV: NavItem[] = [
  { to: '/tickets', label: 'Tickets', icon: Ticket },
  { to: '/visiting-log', label: 'Visiting log', icon: ScrollText, roles: ['super_admin'] },
  { to: '/visiting-report', label: 'Visiting report', icon: ScrollText },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const items = NAV.filter((item) => !item.roles || (user && item.roles.includes(user.role)))

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <LifeBuoy size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">IoT Support</p>
              <p className="text-xs text-slate-500">{user?.company_name ?? 'Super admin console'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{user?.username}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role.replace('_', ' ')}</p>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              aria-label="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-4 sm:px-6">
          <ul className="-mb-px flex gap-6">
            {items.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-1.5 border-b-2 px-1 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-brand-600 text-brand-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`
                  }
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
