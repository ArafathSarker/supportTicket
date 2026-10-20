import { useState } from 'react'
import { VisitingLogForm } from '../components/VisitingLogForm'

/** Visiting-log screen — super admin creates acknowledgement visits sent to the company. */
export function VisitingLogPage() {
  const [saved, setSaved] = useState(false)

  return (
    <div className="space-y-8">
      {saved && (
        <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
          Visiting log saved — the company will see it in their visiting reports.
        </p>
      )}
      <VisitingLogForm onSaved={() => setSaved(true)} />
    </div>
  )
}
