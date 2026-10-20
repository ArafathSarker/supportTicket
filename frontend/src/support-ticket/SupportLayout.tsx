import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LifeBuoy, LogOut, ScrollText, Ticket } from 'lucide-react'

import { useSupportConfig } from './context'

/** Built-in shell for the support screens. Branding & user come from SupportConfig. */
export function SupportLayout() {
  const { user, onLogout, loginPath, branding } = useSupportConfig()
  const navigate = useNavigate()

  const nav = [
    { to: 'tickets', label: 'Tickets', icon: Ticket },
    { to: 'visiting-log', label: 'Visiting log', icon: ScrollText, roles: ['super_admin'] as const },
    { to: 'visiting-report', label: 'Visiting report', icon: ScrollText },
  ].filter((item) => !item.roles || user?.role === item.roles[0])

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <LifeBuoy size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900">{branding?.title ?? 'Support Center'}</p>
              <p className="text-xs text-slate-500">
                {user?.companyName || branding?.subtitle || 'Support console'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{user.username}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            )}
            {onLogout && (
              <button
                type="button"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => {
                  onLogout()
                  if (loginPath) navigate(loginPath)
                }}
                aria-label="Log out"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-4 sm:px-6">
          <ul className="-mb-px flex gap-6">
            {nav.map(({ to, label, icon: Icon }) => (
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
