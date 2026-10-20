import type { Paginated, Ticket, Ticket_CreateInput, TicketStatus } from '../types'
import { supportRequest } from '../client'

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

type Urgency = Ticket_CreateInput['urgency']

export const ticketApi = {
  list(filters: { page: number; status?: string; urgency?: string; priority?: string; search?: string }) {
    const { page, status, urgency, priority, search } = filters
    return supportRequest
      .request<Paginated<Ticket>>('/tickets/', {
        method: 'GET',
        query: { page, status, urgency, priority, search },
      })
      .then(supportRequest.paged)
  },

  get(id: number) {
    return supportRequest.request<Ticket>(`/tickets/${id}/`)
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
      return supportRequest.request<Ticket>('/tickets/', {
        method: 'POST',
        body: form,
      })
    }
    return supportRequest.request<Ticket>('/tickets/', {
      method: 'POST',
      body: JSON.stringify(fields),
    })
  },

  updateStatus(id: number, status: TicketStatus) {
    return supportRequest.request<void>(`/tickets/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
}
