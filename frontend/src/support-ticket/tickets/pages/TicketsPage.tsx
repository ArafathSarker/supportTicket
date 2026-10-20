import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Card } from '../../ui'
import { TicketForm } from '../components/TicketForm'
import { TicketList } from '../components/TicketList'
import { useSupportConfig } from '../../context'

/** Tickets screen — role-aware: company users see & create own tickets, super admin sees all. */
export function TicketsPage() {
  const [showForm, setShowForm] = useState(false)
  const { user } = useSupportConfig()
  const isCompanyAdmin = user?.role === 'company_admin'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isCompanyAdmin ? 'Manage your support requests' : 'Review and manage all support requests'}
          </p>
        </div>
        {isCompanyAdmin && (
          <Button onClick={() => setShowForm((v) => !v)}>
            <Plus size={16} />
            {showForm ? 'Cancel' : 'New Ticket'}
          </Button>
        )}
      </div>
      {showForm && isCompanyAdmin && (
        <Card padding={true} className="overflow-hidden">
          <TicketForm onCreated={() => setShowForm(false)} />
        </Card>
      )}
      <TicketList />
    </div>
  )
}
