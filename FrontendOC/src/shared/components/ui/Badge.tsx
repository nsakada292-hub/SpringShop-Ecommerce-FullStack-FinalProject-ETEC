import { cn } from '@/shared/utils/cn'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  children: React.ReactNode
  className?: string
}

const badgeVariants = {
  default: 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300',
  success: 'bg-brand-green/15 text-brand-green border border-brand-green/25',
  warning: 'bg-amber-500/15 text-amber-500 border border-amber-500/25',
  danger: 'bg-red-500/15 text-red-500 border border-red-500/25',
  info: 'bg-brand-aqua/15 text-brand-aqua border border-brand-aqua/25',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
