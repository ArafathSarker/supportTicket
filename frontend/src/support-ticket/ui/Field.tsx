import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

const labelCls = 'block text-sm font-medium text-slate-700 mb-1'
const controlCls =
  'block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-brand-600 disabled:bg-slate-50 disabled:text-slate-500 transition-shadow'

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, required, id, ...props }: InputProps) {
  return (
    <Field label={label} htmlFor={id} error={error} hint={hint} required={required} className={props.className}>
      <input id={id} required={required} className={controlCls} {...props} />
    </Field>
  )
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, required, id, ...props }: TextareaProps) {
  return (
    <Field label={label} htmlFor={id} error={error} hint={hint} required={required} className={props.className}>
      <textarea id={id} required={required} className={controlCls} {...props} />
    </Field>
  )
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
  hint?: string
  options: { value: string; label: string }[]
  emptyOption?: string
}

export function Select({ label, error, hint, required, id, options, emptyOption, ...props }: SelectProps) {
  return (
    <Field label={label} htmlFor={id} error={error} hint={hint} required={required} className={props.className}>
      <select id={id} required={required} className={controlCls} {...props}>
        {emptyOption && <option value="">{emptyOption}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  )
}

export { controlCls }
