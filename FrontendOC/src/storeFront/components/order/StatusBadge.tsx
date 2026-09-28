import { CheckCircle2, Clock, PackageCheck, PackageX, Truck, type LucideIcon } from 'lucide-react'
import type { OrderStatus } from '@/shared/types'
import { cn } from '@/shared/utils/cn'

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badge: string; dot: string; icon: string; Icon: LucideIcon }
> = {
  PENDING: {
    label: 'Unpaid · Awaiting payment',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    dot: 'bg-amber-500',
    icon: 'text-amber-500 dark:text-amber-400',
    Icon: Clock,
  },
  PAID: {
    label: 'Paid',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    dot: 'bg-blue-500',
    icon: 'text-blue-500 dark:text-blue-400',
    Icon: CheckCircle2,
  },
  SHIPPED: {
    label: 'Shipped',
    badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',
    dot: 'bg-cyan-500',
    icon: 'text-cyan-500 dark:text-cyan-400',
    Icon: Truck,
  },
  DELIVERED: {
    label: 'Completed · Delivered',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    icon: 'text-emerald-500 dark:text-emerald-400',
    Icon: PackageCheck,
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
    dot: 'bg-rose-500',
    icon: 'text-rose-500 dark:text-rose-400',
    Icon: PackageX,
  },
}

interface StatusBadgeProps {
  status: OrderStatus
  size?: 'sm' | 'md'
  className?: string
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING
  const { Icon } = config
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]',
        config.badge,
        className
      )}
    >
      <Icon className={cn('shrink-0', size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3', config.icon)} />
      {config.label}
    </span>
  )
}