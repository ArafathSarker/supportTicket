import { useState } from 'react'
import { VisitingLogForm } from '../components/VisitingLogForm'

/** Visiting-log screen — super admin creates acknowledgement visits sent to the company. */
export function VisitingLogPage() {
  const [saved, setSaved] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visiting Logs</h1>
        <p className="mt-1 text-sm text-slate-600">Create visit acknowledgements for company tickets</p>
      </div>
      {saved && (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200">
          Visiting log saved — the company will see it in their visiting reports.
        </p>
      )}
      <VisitingLogForm onSaved={() => setSaved(true)} />
    </div>
  )
}
