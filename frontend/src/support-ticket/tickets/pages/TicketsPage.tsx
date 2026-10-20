import { useState } from 'react'
import { Card } from '../../ui'
import { TicketForm } from '../components/TicketForm'
import { TicketList } from '../components/TicketList'

/** Tickets screen — role-aware: company users see & create own tickets, super admin sees all. */
export function TicketsPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Close form' : 'New ticket'}
        </button>
      </div>
      {showForm && (
        <Card>
          <TicketForm onCreated={() => setShowForm(false)} />
        </Card>
      )}
      <TicketList />
    </div>
  )
}
