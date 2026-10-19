export type Role = 'super_admin' | 'company_admin'

export interface AuthUser {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role: Role
  company: number | null
  company_name: string | null
}

export interface TokenType {
  access: string
  refresh: string
  user: AuthUser
}
