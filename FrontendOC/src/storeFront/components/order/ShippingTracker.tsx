import { Fragment } from 'react'
import { CheckCircle2, CircleAlert, PackageCheck, Truck } from 'lucide-react'
import type { OrderStatus } from '@/shared/types'
import { cn } from '@/shared/utils/cn'

interface TrackingStep {
  icon: 'placed' | 'paid' | 'shipped' | 'delivered'
  label: string
  description: string
  state: 'done' | 'current' | 'upcoming'
}

function getTrackingSteps(status: OrderStatus): TrackingStep[] | null {
  if (status === 'CANCELLED') return null
  const steps: Omit<TrackingStep, 'state'>[] = [
    { icon: 'placed', label: 'Order Placed', description: 'Order confirmed' },
    { icon: 'paid', label: 'Payment', description: 'Payment confirmed' },
    { icon: 'shipped', label: 'Shipped', description: 'On the way' },
    { icon: 'delivered', label: 'Delivered', description: 'Reached you' },
  ]
  const doneCount =
    status === 'PENDING' ? 1 : status === 'PAID' ? 2 : status === 'SHIPPED' ? 3 : status === 'DELIVERED' ? 4 : 0
  return steps.map((s, i) => ({
    ...s,
    state: i < doneCount ? 'done' : i === doneCount ? 'current' : 'upcoming',
  }))
}

const STEP_ICONS: Record<TrackingStep['icon'], typeof CheckCircle2> = {
  placed: PackageCheck,
  paid: CheckCircle2,
  shipped: Truck,
  delivered: PackageCheck,
}

const stateClasses: Record<TrackingStep['state'], { circle: string; icon: string; label: string }> = {
  done: {
    circle: 'bg-emerald-500 text-white ring-emerald-200 dark:bg-emerald-500 dark:ring-emerald-500/30',
    icon: 'text-white',
    label: 'text-emerald-600 dark:text-emerald-400',
  },
  current: {
    circle: 'bg-white text-[#22c55e] ring-2 ring-[#22c55e] animate-pulse-glow dark:bg-[#0a0a0c] dark:text-[#34d399]',
    icon: 'text-[#22c55e] dark:text-[#34d399]',
    label: 'text-gray-900 dark:text-white',
  },
  upcoming: {
    circle: 'bg-gray-100 text-gray-400 ring-gray-200 dark:bg-white/5 dark:text-gray-500 dark:ring-white/10',
    icon: 'text-gray-400 dark:text-gray-500',
    label: 'text-gray-400 dark:text-gray-500',
  },
}

export function ShippingTracker({ status }: { status: OrderStatus }) {
  const steps = getTrackingSteps(status)

  if (!steps) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400">
        <CircleAlert className="h-5 w-5 shrink-0" />
        This order was cancelled and will not be shipped.
      </div>
    )
  }

  return (
    <div className="flex items-start">
      {steps.map((step, i) => {
        const cls = stateClasses[step.state]
        const Icon = STEP_ICONS[step.icon]
        const next = steps[i + 1]
        const lineDone = next?.state === 'done'
        return (
          <Fragment key={step.label}>
            <div className="flex w-16 flex-col items-center gap-2 sm:w-24">
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 sm:h-10 sm:w-10',
                  cls.circle
                )}
              >
                <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', cls.icon)} />
              </span>
              <div className="text-center">
                <p className={cn('text-[11px] font-bold sm:text-xs', cls.label)}>{step.label}</p>
                <p className="hidden text-[10px] text-gray-400 dark:text-gray-500 sm:block">{step.description}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'relative top-[17px] h-0.5 flex-1 rounded-full sm:top-[19px]',
                  lineDone ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-white/10'
                )}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}