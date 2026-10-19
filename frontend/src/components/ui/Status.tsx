import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin text-brand-600 ${className ?? ''}`} size={20} />
}

export function Loading({ label, className }: { label?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 py-12 text-sm text-slate-500 ${className ?? ''}`}>
      <Spinner />
      {label ?? 'Loading…'}
    </div>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      {children && <p className="mt-1 text-sm text-slate-500">{children}</p>}
    </div>
  )
}
