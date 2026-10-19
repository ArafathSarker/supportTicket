import type { Paginated } from '@/lib/api'

export type Urgency = 'low' | 'medium' | 'high' | 'critical'
export type Priority = Urgency
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'

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

export type TicketList = Paginated<Ticket>
