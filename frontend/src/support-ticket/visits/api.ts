import { supportRequest } from '../client'
import type { Paginated, VisitingLog, VisitingLogInput } from '../types'

export const visitsApi = {
  list(params: { page?: number; company?: number | '' } = {}) {
    return supportRequest
      .request<Paginated<VisitingLog>>('/visiting-logs/', {
        method: 'GET',
        query: { page: params.page ?? 1, company: params.company },
      })
      .then(supportRequest.paged)
  },

  create(payload: VisitingLogInput) {
    return supportRequest.request<VisitingLog>('/visiting-logs/', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        ticket: payload.ticket === '' ? null : payload.ticket,
        company: payload.company === '' ? '' : payload.company,
      }),
    })
  },
}
