import type { OptionsMap } from '@/features/options/types'
import type { TicketStatus, Ticket_CreateInput, TicketList, Urgency } from './types'
import { apiRequest, paged } from '@/lib/api'

export interface CreateTicketPayload extends Omit<Ticket_CreateInput, 'file'> {
  file?: File
}

/** Level meta shared by urgency & priority (fixed levels per spec). */
export const LEVELS: { value: Urgency; label: string; tone: 'neutral' | 'info' | 'warning' | 'critical' }[] = [
  { value: 'low', label: 'Low', tone: 'neutral' },
  { value: 'medium', label: 'Medium', tone: 'info' },
  { value: 'high', label: 'High', tone: 'warning' },
  { value: 'critical', label: 'Critical', tone: 'critical' },
]

export const STATUS_META: Record<TicketStatus, { label: string; tone: 'neutral' | 'info' | 'success' | 'warning' }> = {
  open: { label: 'Open', tone: 'warning' },
  in_progress: { label: 'In progress', tone: 'info' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
}

export const ticketApi = {
  list(filters: { page: number; status?: string; urgency?: string; priority?: string; search?: string }) {
    const { page, status, urgency, priority, search } = filters
    return apiRequest<TicketList>('/api/tickets/', {
      method: 'GET',
      query: { page, status, urgency, priority, search },
    }).then(paged)
  },

  get(id: number) {
    return apiRequest<import('./types').Ticket>(`/api/tickets/${id}/`)
  },

  create(payload: CreateTicketPayload) {
    const { file, file_type, ...fields } = payload
    if (file) {
      const form = new FormData()
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null) form.append(key, String(value))
      }
      form.append('file', file)
      form.append('file_type', file_type ?? 'other')
      return apiRequest<import('./types').Ticket>('/api/tickets/', {
        method: 'POST',
        body: form,
        asForm: true,
      })
    }
    return apiRequest<import('./types').Ticket>('/api/tickets/', {
      method: 'POST',
      body: JSON.stringify(fields),
    })
  },

  updateStatus(id: number, status: TicketStatus) {
    return apiRequest<void>(`/api/tickets/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  /** Dynamic dropdown options for affected systems & problem categories. */
  options(): Promise<OptionsMap> {
    return apiRequest<OptionsMap>('/api/options/')
  },
}
