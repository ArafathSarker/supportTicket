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
