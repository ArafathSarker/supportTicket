/* eslint-disable react-refresh/only-export-components -- helper used alongside the Pagination component */
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface PageMeta {
  page: number
  pageSize: number
  count: number
}

export function totalPages({ pageSize, count }: { pageSize: number; count: number }): number {
  return Math.max(1, Math.ceil(count / Math.max(pageSize, 1)))
}

export function Pagination({
  page,
  pageSize,
  count,
  onPage,
  className,
}: PageMeta & { onPage: (page: number) => void; className?: string }) {
  const pages = totalPages({ pageSize, count })
  if (count === 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, count)

  const numbers = numberRange(page, pages)

  return (
    <nav className={`flex items-center justify-between gap-2 ${className ?? ''}`} aria-label="Pagination">
      <p className="text-sm text-slate-600">
        Showing <span className="font-medium">{start}–{end}</span> of{' '}
        <span className="font-medium">{count}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {numbers.map((n) =>
          n === '…' ? (
            <span key={n} className="px-1 text-slate-400">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              onClick={() => onPage(n)}
              className={`min-w-8 rounded-md px-2 py-1 text-sm font-medium ${
                n === page ? 'bg-brand-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
              aria-current={n === page ? 'page' : undefined}
            >
              {n}
            </button>
          ),
        )}
        <button
          type="button"
          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPage(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  )
}

/** Compact page list with ellipsis, e.g. 1 … 3 4 5 … 9 */
function numberRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const items: (number | '…')[] = [1]
  const from = Math.max(current - 2, 2)
  const to = Math.min(current + 2, total - 1)
  if (from > 2) items.push('…')
  for (let i = from; i <= to; i++) items.push(i)
  if (to < total - 1) items.push('…')
  items.push(total)
  return items
}
