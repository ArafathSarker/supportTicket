import { apiRequest, paged } from '@/lib/api'
import type { Paginated } from '@/lib/api'
import type { VisitingLog, VisitingLogInput } from './types'

export const visitsApi = {
  list(params: { page?: number; company?: number | '' } = {}) {
    return apiRequest<Paginated<VisitingLog>>('/api/visiting-logs/', {
      method: 'GET',
      query: { page: params.page ?? 1, company: params.company },
    }).then(paged)
  },

  create(payload: VisitingLogInput) {
    return apiRequest<VisitingLog>('/api/visiting-logs/', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        ticket: payload.ticket === '' ? null : payload.ticket,
        company: payload.company === '' ? '' : payload.company,
      }),
    })
  },
}
