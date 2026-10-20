/**
 * ★ support-ticket — the single public barrel.
 *
 * Drop this `src/support-ticket/` folder into any React + Tailwind 4 project,
 * point it at a backend running the `support_ticket` Django app, and wire it:
 *
 *   <SupportProvider config={{
 *     apiBase: '/api',                       // REST base
 *     user: { id: 3, username: 'acme', role: 'company_admin' },
 *     getAuthHeaders: () => ({ Authorization: `Bearer ${token}` }),
 *     getAccessToken: () => token,           // for the WebSocket chat
 *     onUnauthorized: () => redirectToLogin(),
 *     onLogout: () => clearSession(),
 *   }}>
 *     <SupportRoutes />                      // <Route path="*" element={...} />
 *   </SupportProvider>
 *
 * Everything is also exported à la carte (pages, components, hooks, APIs, UI)
 * so hosts can compose their own screens instead of using SupportRoutes.
 */

// Provider / config / routing
export {
  SupportProvider,
  useSupportConfig,
  useSupportRoutes,
  useHasRole,
  RequireRole,
  type SupportRoutesMap,
} from './context'
export { supportRequest, createRequest, getAccessTokenFromConfig, type Requester, type RequestOptions } from './client'
export { ApiError, makeQuery, paged, type FieldErrors } from './api'
export { SupportLayout } from './SupportLayout'
export { SupportRoutes } from './SupportRoutes'
export { PAGE_SIZE } from './constants'
export { useOptions } from './options'

// Tickets
export * from './tickets'
export { useTicketChat, TicketChat, type ChatStatus } from './chat'

// Visits
export * from './visits'

// UI primitives (also used by host surfaces that want a consistent look)
export * from './ui'

// Types
export type {
  Role,
  SupportUser,
  SupportConfig,
  Ticket,
  TicketAttachment,
  TicketMessage,
  Ticket_CreateInput,
  TicketFilters,
  Urgency,
  Priority,
  TicketStatus,
  OptionsMap,
  VisitingLog,
  VisitingLogInput,
  Paginated,
} from './types'
