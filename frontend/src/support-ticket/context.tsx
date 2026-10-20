/* eslint-disable react-refresh/only-export-components -- a React Context module: the Provider and its hooks live together */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { supportRequest } from './client'
import type { Role, SupportConfig } from './types'

/** Default values applied before the host overrides them. */
export const defaultSupportConfig: SupportConfig = {
  apiBase: '/api',
  wsBase:
    typeof window !== 'undefined'
      ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`
      : '',
  basePath: '',
  loginPath: '/login',
  user: null,
}

const ConfigContext = createContext<SupportConfig>(defaultSupportConfig)

export function SupportProvider({ config, children }: { config: SupportConfig; children: ReactNode }) {
  const value = useMemo<SupportConfig>(
    () => ({ ...defaultSupportConfig, ...config }),
    [config],
  )

  // Wire the standalone client to the active config so feature modules can
  // call `supportRequest` without prop-drilling the context everywhere.
  useEffect(() => {
    supportRequest.setConfig(value)
    return () => supportRequest.setConfig(defaultSupportConfig)
  }, [value])

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
}

export function useSupportConfig(): SupportConfig {
  return useContext(ConfigContext)
}

export interface SupportRoutesMap {
  tickets: string
  ticketDetail: (id: number | string) => string
  visitingLog: string
  visitingReport: string
}

/** Internal navigation paths, honoring the configured basePath. */
export function useSupportRoutes(): SupportRoutesMap {
  const { basePath = '' } = useSupportConfig()
  return useMemo(
    () => ({
      tickets: `${basePath}/tickets`,
      ticketDetail: (id: number | string) => `${basePath}/tickets/${id}`,
      visitingLog: `${basePath}/visiting-log`,
      visitingReport: `${basePath}/visiting-report`,
    }),
    [basePath],
  )
}

/** True when the configured user has the given role. */
export function useHasRole(role: Role): boolean {
  const { user } = useSupportConfig()
  return user?.role === role
}

/** Role gate for the super-admin-only screens. */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useSupportConfig()
  if (user && roles.includes(user.role)) return <>{children}</>
  return <Navigate to=".." replace />
}
