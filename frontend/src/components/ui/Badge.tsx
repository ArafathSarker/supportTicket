import type { HTMLAttributes, ReactNode } from 'react'

const tones = {
  neutral: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  danger: 'bg-red-50 text-red-700 ring-red-600/20',
  critical: 'bg-red-600 text-white ring-red-700/40',
} as const

export type Tone = keyof typeof tones

export function Badge({
  tone = 'neutral',
  children,
  className,
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]} ${className ?? ''}`}
    >
      {children}
    </span>
  )
}

export function Card({ className, children }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
