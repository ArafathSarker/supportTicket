import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Building2,
  ClipboardList,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Ticket,
  X,
} from 'lucide-react'

import { useSupportConfig } from './context'

/** Responsive component shell with a dedicated sidebar and top header. */
export function SupportLayout() {
  const { user, branding } = useSupportConfig()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  const isSuperAdmin = user?.role === 'super_admin'
  const nav = [
    { to: 'tickets', label: 'Support tickets', icon: Ticket },
    ...(isSuperAdmin
      ? [{ to: 'visiting-log', label: 'Visiting log', icon: ClipboardList }]
      : [{ to: 'visiting-report', label: 'Visiting report', icon: ClipboardList }]),
  ]

  const closeMobile = () => setMobileOpen(false)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-slate-950/40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-20' : ''}`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
          <button
            type="button"
            className="flex min-w-0 items-center gap-3 text-left"
            onClick={() => navigate('tickets')}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-600 text-white">
              <Building2 size={20} />
            </span>
            {!collapsed && (
              <span className="truncate">
                <strong className="block text-sm">{branding?.title ?? 'IoT Support'}</strong>
                <span className="text-xs text-slate-500">Operations console</span>
              </span>
            )}
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={closeMobile}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className={`mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${collapsed ? 'lg:hidden' : ''}`}>
            Workspace
          </p>
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon size={19} />
              <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={`border-t border-slate-200 p-4 ${collapsed ? 'lg:px-2' : ''}`}>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
              {user?.username.slice(0, 1).toUpperCase() ?? 'D'}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user?.username ?? 'Demo user'}</p>
                <p className="truncate text-xs capitalize text-slate-500">
                  {user?.role.replace('_', ' ') ?? 'operator'}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <button
              type="button"
              className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:block"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
            </button>
            <div>
              <p className="text-sm font-semibold sm:text-base">
                {isSuperAdmin ? 'Super admin workspace' : 'Company support workspace'}
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                {isSuperAdmin ? 'Manage requests and factory visits' : 'Request help and review visit acknowledgements'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">{user?.companyName ?? 'All companies'}</p>
            <p className="text-xs capitalize text-slate-500">{user?.role.replace('_', ' ')}</p>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
