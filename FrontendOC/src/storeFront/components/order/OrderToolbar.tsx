import { LayoutGrid, LayoutList, ListCollapse } from 'lucide-react'
import { ORDER_FILTERS, VIEWS, type OrderFilter, type OrderView } from './order-utils'
import { cn } from '@/shared/utils/cn'

type Counts = Record<OrderFilter, number>

interface OrderToolbarProps {
  filter: OrderFilter
  onFilterChange: (filter: OrderFilter) => void
  view: OrderView
  onViewChange: (view: OrderView) => void
  counts: Counts
  filteredCount: number
  totalCount: number
}

const VIEW_ICONS: Record<OrderView, typeof LayoutGrid> = {
  list: LayoutList,
  grid: LayoutGrid,
  accordion: ListCollapse,
}

export function OrderToolbar({
  filter,
  onFilterChange,
  view,
  onViewChange,
  counts,
  filteredCount,
  totalCount,
}: OrderToolbarProps) {
  return (
    <div className="mb-6 rounded-2xl border border-gray-100 bg-white/90 p-3 shadow-sm backdrop-blur dark:border-white/5 dark:bg-white/[0.03]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ORDER_FILTERS.map((f) => {
            const active = filter === f.key
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onFilterChange(f.key)}
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 active:scale-95',
                  active
                    ? 'bg-gradient-to-r from-[#34d399] to-[#22c55e] text-white shadow-md shadow-[#22c55e]/25'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white'
                )}
              >
                {f.label}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                    active ? 'bg-white/25 text-white' : 'bg-white text-gray-500 dark:bg-white/15 dark:text-gray-300'
                  )}
                >
                  {counts[f.key]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
            Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{filteredCount}</span> of {totalCount}{' '}
            orders
          </p>
          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1 dark:bg-white/5">
            {VIEWS.map((v) => {
              const Icon = VIEW_ICONS[v.key]
              const active = view === v.key
              return (
                <button
                  key={v.key}
                  type="button"
                  aria-label={v.label}
                  title={v.label}
                  onClick={() => onViewChange(v.key)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200 active:scale-90',
                    active
                      ? 'bg-white text-[#22c55e] shadow ring-1 ring-gray-200 dark:bg-white/10 dark:text-[#34d399] dark:ring-white/10'
                      : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}