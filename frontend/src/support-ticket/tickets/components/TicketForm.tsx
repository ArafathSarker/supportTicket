import { useMemo, useState } from 'react'
import { Card, FileDrop, Input, Select, Textarea, type FileDraft } from '../../ui'
import { useOptions } from '../../options'
import { LEVELS } from '../api'
import { useCreateTicket } from '../hooks'
import type { Urgency } from '../../types'

export interface TicketFormProps {
  /** Called after the ticket is created successfully. */
  onCreated?: () => void
}

const levelOptions = LEVELS.map((l) => ({ value: l.value, label: l.label }))

/** Create-ticket form: dynamic dropdowns + optional image/video attachment. */
export function TicketForm({ onCreated }: TicketFormProps) {
  const { options, loading: optionsLoading } = useOptions()

  const systemOptions = useMemo(
    () => (options.system ?? []).map((s) => ({ value: s, label: s })),
    [options],
  )
  const categoryOptions = useMemo(
    () => (options.category ?? []).map((c) => ({ value: c, label: c })),
    [options],
  )

  const [files, setFiles] = useState<FileDraft[]>([])
  const [title, setTitle] = useState('')
  const [affectedSystem, setAffectedSystem] = useState('')
  const [newSystem, setNewSystem] = useState('')
  const [problemCategory, setProblemCategory] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [urgency, setUrgency] = useState<Urgency>('medium')
  const [priority, setPriority] = useState<Urgency>('medium')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { submit, submitting } = useCreateTicket(onCreated ?? (() => {}))

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrors({})
    const localErrors: Record<string, string> = {}
    if (!title.trim()) localErrors.title = 'Title is required'
    if (!affectedSystem && !newSystem.trim()) localErrors.affected_system = 'Select or add an affected system'
    if (!problemCategory && !newCategory.trim()) localErrors.problem_category = 'Select or add a problem category'
    setErrors(localErrors)
    if (Object.keys(localErrors).length) return

    const system = affectedSystem || newSystem.trim()
    const category = problemCategory || newCategory.trim()
    const draft = files[0]

    submit({
      title: title.trim(),
      affected_system: system,
      problem_category: category,
      urgency,
      priority,
      description,
      file: draft?.file,
      file_type: draft?.fileType,
    })

    setTitle('')
    setAffectedSystem('')
    setProblemCategory('')
    setUrgency('medium')
    setPriority('medium')
    setDescription('')
    setFiles([])
    setNewSystem('')
    setNewCategory('')
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900">Create Support Ticket</h2>
      <p className="mt-1 mb-6 text-sm text-slate-500">
        Describe the problem with the affected system — attachments are stored securely.
      </p>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Input
          id="ticket-title"
          label="Title / problem summary"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Select
              id="ticket-system"
              label="Affected system"
              emptyOption={optionsLoading ? 'Loading…' : 'Select system…'}
              options={systemOptions}
              value={affectedSystem}
              onChange={(e) => setAffectedSystem(e.target.value)}
              error={errors.affected_system}
              disabled={optionsLoading}
            />
            <Input
              id="ticket-system-custom"
              label="Or add a new system"
              placeholder="Type to add dynamically"
              value={newSystem}
              onChange={(e) => setNewSystem(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Select
              id="ticket-category"
              label="Problem category"
              emptyOption={optionsLoading ? 'Loading…' : 'Select category…'}
              options={categoryOptions}
              value={problemCategory}
              onChange={(e) => setProblemCategory(e.target.value)}
              error={errors.problem_category}
              disabled={optionsLoading}
            />
            <Input
              id="ticket-category-custom"
              label="Or add a new category"
              placeholder="Type to add dynamically"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </div>
          <Select
            id="ticket-urgency"
            label="Urgency level"
            options={levelOptions}
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as Urgency)}
            required
          />
          <Select
            id="ticket-priority"
            label="Priority level"
            options={levelOptions}
            value={priority}
            onChange={(e) => setPriority(e.target.value as Urgency)}
            required
          />
        </div>

        <Textarea
          id="ticket-description"
          label="Describe the problem in detail"
          required
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <FileDrop label="Attachments (picture / video)" onChange={setFiles} />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 transition-all"
          >
            {submitting ? 'Submitting…' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  )
}
