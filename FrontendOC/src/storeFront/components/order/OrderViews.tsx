import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Package,
  Truck,
} from 'lucide-react'
import type { Order, OrderItem } from '@/shared/types'
import { cn } from '@/shared/utils/cn'
import { formatDateTime, formatPrice } from '@/shared/utils/cn'
import { getImageGradient } from '@/shared/utils/imageGradient'
import {
  getDeliveryEstimate,
  getItemCount,
  isUnpaid,
  orderTotal,
  type OrderGroup,
  type OrderView,
} from './order-utils'
import { StatusBadge } from './StatusBadge'
import { OrderPreview } from './OrderPreview'
import { OrderActions } from './OrderActions'
import { ShippingTracker } from './ShippingTracker'

export interface OrderCardProps {
  order: Order
  getImage: (productId: number) => string | undefined
  onRequestCancel?: (order: Order) => void
}

function OrderNumberLink({ order, className }: { order: Order; className?: string }) {
  return (
    <Link
      to={`/orders/${order.id}`}
      className={cn(
        'text-sm font-bold text-gray-900 transition-colors hover:text-[#22c55e] dark:text-white dark:hover:text-[#34d399]',
        className
      )}
    >
      Order #{order.orderNumber ?? order.id}
    </Link>
  )
}

function CardShell({
  unpaid,
  children,
  className,
}: {
  unpaid: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white shadow-sm ring-1 transition-all duration-300 hover:shadow-lg dark:bg-white/[0.03]',
        unpaid
          ? 'border-l-4 border-l-amber-400 ring-amber-200/70 hover:shadow-amber-100/50 dark:ring-amber-500/20 dark:hover:shadow-black/40'
          : 'ring-gray-100 hover:shadow-gray-200/40 dark:ring-white/5 dark:hover:shadow-black/40',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ------------------------------- List view ------------------------------- */

export function ListOrderCard({ order, getImage, onRequestCancel }: OrderCardProps) {
  const unpaid = isUnpaid(order)
  const estimate = getDeliveryEstimate(order)
  return (
    <CardShell unpaid={unpaid} className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start gap-4">
        <OrderPreview order={order} getImage={getImage} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <OrderNumberLink order={order} />
            <StatusBadge status={order.status} size="sm" />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {getItemCount(order)} {getItemCount(order) === 1 ? 'item' : 'items'} · Placed on {formatDateTime(order.orderDate)}
          </p>
          {estimate && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300">
              <CalendarDays className="h-3.5 w-3.5 text-[#22c55e] dark:text-[#34d399]" />
              {estimate.label}: <span className="font-bold">{estimate.value}</span>
            </p>
          )}
        </div>
        <div className="ml-auto flex flex-col items-end gap-1">
          <span className="text-lg font-bold text-gray-900 dark:text-white">{orderTotal(order)}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {getItemCount(order)} {getItemCount(order) === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-gray-100 pt-3 dark:border-white/5">
        <Link
          to={`/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400 transition-colors hover:text-[#22c55e] dark:text-gray-500 dark:hover:text-[#34d399]"
        >
          View details
          <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
        </Link>
        <OrderActions order={order} onRequestCancel={onRequestCancel} />
      </div>
    </CardShell>
  )
}

/* ------------------------------- Grid view ------------------------------- */

function GridImage({ order, getImage }: { order: Order; getImage: OrderCardProps['getImage'] }) {
  const first = order.items[0]
  const image = first ? getImage(first.productId) : undefined
  if (image) {
    return (
      <img
        src={image}
        alt={first?.productName ?? 'Order'}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    )
  }
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: first ? getImageGradient(first.productId) : undefined }}
    >
      <Package className="h-10 w-10 text-white/80" />
    </div>
  )
}

export function GridOrderCard({ order, getImage, onRequestCancel }: OrderCardProps) {
  const unpaid = isUnpaid(order)
  const estimate = getDeliveryEstimate(order)
  return (
    <CardShell unpaid={unpaid} className="group overflow-hidden">
      <Link
        to={`/orders/${order.id}`}
        className="relative block aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-white/5"
      >
        <GridImage order={order} getImage={getImage} />
        <span className="absolute left-3 top-3">
          <StatusBadge status={order.status} size="sm" />
        </span>
        {unpaid && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-amber-600 shadow backdrop-blur dark:bg-black/60 dark:text-amber-400">
            Action required
          </span>
        )}
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <OrderNumberLink order={order} className="line-clamp-1" />
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Placed {formatDateTime(order.orderDate)}
            </p>
          </div>
          <span className="text-base font-bold text-gray-900 dark:text-white">{orderTotal(order)}</span>
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
          {estimate ? (
            <>
              <CalendarDays className="h-3.5 w-3.5 text-[#22c55e] dark:text-[#34d399]" />
              {estimate.label} {estimate.value}
            </>
          ) : (
            <span className="font-medium text-rose-500">No delivery</span>
          )}
        </p>
        <div className="mt-3">
          <OrderActions order={order} onRequestCancel={onRequestCancel} stretch size="sm" />
        </div>
      </div>
    </CardShell>
  )
}

/* ---------------------------- Accordion (detail) ---------------------------- */

function AccordionItemRows({ order }: { order: Order }) {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-white/5">
      {order.items.map((item: OrderItem) => (
        <li key={item.id} className="flex items-center gap-3 py-2.5">
          <Link
            to={`/product/${item.productId}`}
            className="min-w-0 flex-1 truncate text-sm font-medium text-gray-700 transition-colors hover:text-[#22c55e] dark:text-gray-200 dark:hover:text-[#34d399]"
          >
            {item.productName}
          </Link>
          <span className="text-xs text-gray-400 dark:text-gray-500">×{item.quantity}</span>
          <span className="w-20 text-right text-sm font-semibold text-gray-900 dark:text-white">
            {formatPrice(item.subtotal)}
          </span>
        </li>
      ))}
    </ul>
  )
}

function PaymentBreakdown({ order }: { order: Order }) {
  const unpaid = isUnpaid(order)
  const subtotal = order.items.reduce((sum, i) => sum + i.subtotal, 0)
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
        Payment breakdown
      </h4>
      <dl className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
          <dt>Shipping</dt>
          <dd className="font-semibold text-[#22c55e] dark:text-[#34d399]">Free</dd>
        </div>
        <div className="flex items-center justify-between border-t border-dashed border-gray-100 pt-2 dark:border-white/10">
          <dt className="font-semibold text-gray-900 dark:text-white">Total {order.currency === 'KHR' ? '(KHR)' : ''}</dt>
          <dd className="text-base font-bold text-gray-900 dark:text-white">{orderTotal(order)}</dd>
        </div>
        <div className="flex items-center justify-between pt-1">
          <dt className="text-gray-500 dark:text-gray-400">Payment</dt>
          <dd>
            {unpaid ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                Awaiting payment
              </span>
            ) : order.status === 'CANCELLED' ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-500 dark:bg-white/10 dark:text-gray-400">
                Cancelled · no charge
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Paid
              </span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  )
}

export function AccordionOrderCard({ order, getImage, onRequestCancel }: OrderCardProps) {
  const unpaid = isUnpaid(order)
  const estimate = getDeliveryEstimate(order)
  const [expanded, setExpanded] = useState(false)
  return (
    <CardShell unpaid={unpaid} className="overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 p-4 text-left sm:gap-4 sm:p-5"
      >
        <OrderPreview order={order} getImage={getImage} size="sm" />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Order #{order.orderNumber ?? order.id}
            </span>
            <StatusBadge status={order.status} size="sm" />
          </span>
          <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
            {getItemCount(order)} {getItemCount(order) === 1 ? 'item' : 'items'} · {formatDateTime(order.orderDate)}
          </span>
          {estimate && (
            <span className="mt-1 hidden items-center gap-1.5 text-xs text-gray-600 sm:flex dark:text-gray-300">
              <Truck className="h-3.5 w-3.5 text-[#22c55e] dark:text-[#34d399]" />
              {estimate.label} {estimate.value}
            </span>
          )}
        </span>
        <span className="flex flex-col items-end gap-1">
          <span className="text-base font-bold text-gray-900 dark:text-white">{orderTotal(order)}</span>
          <ChevronDown
            className={cn(
              'h-5 w-5 text-gray-400 transition-transform duration-300 dark:text-gray-500',
              expanded && 'rotate-180'
            )}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-dashed border-gray-100 p-4 sm:p-5 dark:border-white/5">
              <div>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  Items purchased
                </h4>
                <AccordionItemRows order={order} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <PaymentBreakdown order={order} />
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Shipping
                  </h4>
                  <ShippingTracker status={order.status} />
                </div>
              </div>
              <div className="flex items-center justify-end border-t border-dashed border-gray-100 pt-3 dark:border-white/5">
                <OrderActions order={order} onRequestCancel={onRequestCancel} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CardShell>
  )
}

/* ------------------------------- Date group ------------------------------- */

interface OrderGroupSectionProps {
  group: OrderGroup
  view: OrderView
  getImage: OrderCardProps['getImage']
  onRequestCancel?: OrderCardProps['onRequestCancel']
}

export function OrderGroupSection({ group, view, getImage, onRequestCancel }: OrderGroupSectionProps) {
  const cards = {
    list: (
      <div className="space-y-3">
        {group.orders.map((order) => (
          <ListOrderCard key={order.id} order={order} getImage={getImage} onRequestCancel={onRequestCancel} />
        ))}
      </div>
    ),
    grid: (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {group.orders.map((order) => (
          <GridOrderCard key={order.id} order={order} getImage={getImage} onRequestCancel={onRequestCancel} />
        ))}
      </div>
    ),
    accordion: (
      <div className="space-y-3">
        {group.orders.map((order) => (
          <AccordionOrderCard key={order.id} order={order} getImage={getImage} onRequestCancel={onRequestCancel} />
        ))}
      </div>
    ),
  }

  return (
    <section className="mb-8">
      <header className="mb-3 flex items-center gap-3">
        <h2 className="text-sm font-bold tracking-wider text-gray-400 uppercase dark:text-gray-500">{group.label}</h2>
        <span className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-white/10" />
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">{group.orders.length}</span>
      </header>
      {cards[view]}
    </section>
  )
}