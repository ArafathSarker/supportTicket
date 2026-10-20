import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Circle, Save } from 'lucide-react'
import { Button, Card, Field, Input, Textarea } from '../../ui'
import { supportRequest } from '../../client'
import { useOptions } from '../../options'
import { visitsApi } from '../api'
import type { VisitingLogInput } from '../../types'
import { mergeWorkPerformed } from '../constants'

interface CompanyOption {
  id: number | string
  label: string
}

interface TicketOption {
  id: number
  title: string
}

const selectCls =
  'block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-brand-600'

/** Super admin form: acknowledgement visit sent to the company. */
export function VisitingLogForm({ onSaved }: { onSaved?: () => void }) {
  const { options, loading: optionsLoading } = useOptions()
  const workItems = useMemo(() => mergeWorkPerformed(options.work_performed), [options])

  const [companies, setCompanies] = useState<CompanyOption[]>([])
  const [companyId, setCompanyId] = useState('')
  const [tickets, setTickets] = useState<TicketOption[]>([])
  const [ticket, setTicket] = useState('')
  const [visitingDate, setVisitingDate] = useState(new Date().toISOString().slice(0, 10))
  const [persons, setPersons] = useState(1)
  const [phones, setPhones] = useState('')
  const [reason, setReason] = useState('')
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Default serializer returns { id, label }; custom host serializers may
    // return other keys, so we map defensively.
    supportRequest
      .request<unknown[]>('/companies/')
      .then((rows) => {
        const mapped: CompanyOption[] = []
        for (const row of rows) {
          const r = row as Record<string, unknown>
          if (r.id === undefined || (r.label === undefined && r.name === undefined)) continue
          mapped.push({ id: r.id as number, label: String(r.label ?? r.name) })
        }
        setCompanies(mapped)
      })
      .catch(() => setCompanies([]))
  }, [])

  const onCompanyChange = async (value: string) => {
    setCompanyId(value)
    setTicket('')
    setTickets([])
    if (!value) return
    try {
      const data = await supportRequest.request<{ results: TicketOption[] }>('/tickets/', {
        query: { company: value, page: 1 },
      })
      setTickets((data.results ?? []).slice(0, 50))
    } catch {
      setTickets([])
    }
  }

  const toggleItem = (label: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!companyId) errs.company = 'Company is required'
    if (!phones.trim()) errs.responsible_phone_numbers = 'At least one phone is required'
    if (!reason.trim()) errs.reason = 'Reason is required'
    setErrors(errs)
    if (Object.keys(errs).length) return

    const payload: VisitingLogInput = {
      company: Number(companyId),
      ticket: ticket === '' ? '' : Number(ticket),
      visiting_date: visitingDate,
      number_of_persons: persons,
      responsible_phone_numbers: phones.trim(),
      reason: reason.trim(),
      work_performed: [...checked],
    }
    setSaving(true)
    try {
      await visitsApi.create(payload)
      // reset
      setReason(''); setChecked(new Set()); setTicket(''); setPhones(''); setPersons(1)
      onSaved?.()
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card padding={true}>
      <h2 className="text-lg font-semibold text-slate-900">New Visiting Log</h2>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Acknowledge a company's ticket with the details of the on-site visit.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Company" error={errors.company} required>
            <select className={selectCls} value={companyId} onChange={(e) => onCompanyChange(e.target.value)}>
              <option value="">Select company…</option>
              {companies.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Acknowledgement for ticket">
            <select className={selectCls} value={ticket} onChange={(e) => setTicket(e.target.value)} disabled={!companyId}>
              <option value="">No linked ticket</option>
              {tickets.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.id} — {t.title}
                </option>
              ))}
            </select>
          </Field>
          <Input
            id="visit-date"
            label="Visiting date"
            type="date"
            required
            value={visitingDate}
            onChange={(e) => setVisitingDate(e.target.value)}
          />
          <Input
            id="visit-persons"
            label="Number of persons"
            type="number"
            min={1}
            required
            value={persons}
            onChange={(e) => setPersons(Math.max(1, Number(e.target.value) || 1))}
          />
          <Input
            id="visit-phones"
            label="Responsible phone numbers"
            required
            hint="Comma separated, e.g. +8801700000000, +8801800000000"
            value={phones}
            onChange={(e) => setPhones(e.target.value)}
            error={errors.responsible_phone_numbers}
            className="sm:col-span-2"
          />
        </div>

        <Textarea
          id="visit-reason"
          label="Reason"
          required
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          error={errors.reason}
        />

        <div>
          <p className="text-sm font-medium text-slate-700 mb-2">Select work performed</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {optionsLoading && <p className="text-sm text-slate-400">Loading checklist…</p>}
            {!optionsLoading &&
              workItems.map((item) => {
                const on = checked.has(item)
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleItem(item)}
                    aria-pressed={on}
                    className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all ${
                      on
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    {on ? (
                      <CheckCircle2 size={16} className="text-brand-600" />
                    ) : (
                      <Circle size={16} className="text-slate-400" />
                    )}
                    <span className="flex-1">{item}</span>
                  </button>
                )
              })}
          </div>
        </div>

        {errors.form && <p className="text-sm text-red-600">{errors.form}</p>}

        <Button type="submit" loading={saving}>
          <Save size={16} /> Save visiting log
        </Button>
      </form>
    </Card>
  )
}
