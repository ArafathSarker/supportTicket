/** Domain types for the support-ticket component. */

export type Role = 'super_admin' | 'company_admin'
export type Urgency = 'low' | 'medium' | 'high' | 'critical'
export type Priority = Urgency
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

/** What a host must provide about the signed-in user. Map your own user type onto it. */
export interface SupportUser {
  id: number
  username: string
  role: Role
  companyName?: string | null
}

export interface Ticket {
  id: number
  company: number
  company_name: string
  created_by: number
  created_by_username: string
  title: string
  affected_system: string
  problem_category: string
  urgency: Urgency
  priority: Priority
  description: string
  status: TicketStatus
  attachment_count: number
  created_at: string
  updated_at: string
}

export interface TicketAttachment {
  id: number
  file: string
  file_url: string | null
  file_type: 'image' | 'video' | 'other'
  uploaded_by: number | null
  uploaded_at: string
}

export interface TicketMessage {
  id: number
  ticket: number
  sender: number
  sender_username: string
  sender_role: string
  content: string
  created_at: string
}

export interface Ticket_CreateInput {
  title: string
  affected_system: string
  problem_category: string
  urgency: Urgency
  priority: Priority
  description: string
  file?: File | null
  file_type?: 'image' | 'video' | 'other'
}

export interface TicketFilters {
  status?: TicketStatus | ''
  urgency?: Urgency | ''
  priority?: Priority | ''
  search?: string
}

/** Shape of GET /options/ — dynamic dropdown labels grouped by key. */
export interface OptionsMap {
  system: string[]
  category: string[]
  work_performed: string[]
  [key: string]: string[] | undefined
}

export interface VisitingLog {
  id: number
  ticket: number | null
  ticket_title: string | null
  company: number
  company_name: string
  created_by: number
  created_by_username: string
  visiting_date: string
  number_of_persons: number
  responsible_phone_numbers: string
  reason: string
  work_performed: string[]
  created_at: string
  updated_at: string
}

export interface VisitingLogInput {
  ticket: number | ''
  company: number | ''
  visiting_date: string
  number_of_persons: number
  responsible_phone_numbers: string
  reason: string
  work_performed: string[]
}

/** DRF PageNumberPagination payload. */
export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Host-project integration surface. Everything variable about where the
 * component lives — endpoints, auth, branding, routing, the signed-in user —
 * flows through SupportConfig, so the component itself stays portable.
 */
export interface SupportConfig {
  /** Base URL of the component's REST endpoints. Default '/api'. */
  apiBase?: string
  /** WebSocket origin for the ticket chat. Default ws(s)://window.location.host. */
  wsBase?: string
  /** Auth headers for every REST request (e.g. { Authorization: 'Bearer ...' }). */
  getAuthHeaders?: () => Record<string, string>
  /** Raw access token for the WebSocket ?token= auth (if not inside getAuthHeaders). */
  getAccessToken?: () => string | null
  /** Called on any 401 — the host decides what to do (refresh, logout, redirect). */
  onUnauthorized?: (error: unknown) => void
  /** The signed-in user; role gates the super-admin screens. */
  user: SupportUser | null
  /** Called by the layout's logout button (also clears session on the host side). */
  onLogout?: () => void
  /** App route the layout should send users to after logout. */
  loginPath?: string
  /** Path prefix under which the component's routes are mounted, e.g. '/support'. Default ''. */
  basePath?: string
  /** Branding shown in the built-in layout. */
  branding?: { title?: string; subtitle?: string }
}
