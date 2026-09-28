import type { Order } from '@/shared/types'
import { formatDate, formatPaymentAmount } from '@/shared/utils/cn'

export type OrderFilter = 'all' | 'pending' | 'processing' | 'completed' | 'cancelled'
export type OrderView = 'list' | 'grid' | 'accordion'

export const ORDER_FILTERS: { key: OrderFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Unpaid' },
  { key: 'processing', label: 'Paid / Processing' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
]

export const VIEWS: { key: OrderView; label: string }[] = [
  { key: 'list', label: 'List view' },
  { key: 'grid', label: 'Grid / Compact view' },
  { key: 'accordion', label: 'Expandable view' },
]

export function matchesFilter(order: Order, filter: OrderFilter): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'pending':
      return order.status === 'PENDING'
    case 'processing':
      return order.status === 'PAID' || order.status === 'SHIPPED'
    case 'completed':
      return order.status === 'DELIVERED'
    case 'cancelled':
      return order.status === 'CANCELLED'
  }
}

export function isUnpaid(order: Order): boolean {
  return order.status === 'PENDING'
}

export function getItemCount(order: Order): number {
  return order.items.reduce((sum, i) => sum + i.quantity, 0)
}

export function orderTotal(order: Order): string {
  return formatPaymentAmount(order.totalAmount, order.currency ?? 'USD')
}

export function addDays(base: Date, days: number): Date {
  const d = new Date(base.getTime())
  d.setDate(d.getDate() + days)
  return d
}

export interface DeliveryEstimate {
  label: string
  value: string
}

export function getDeliveryEstimate(order: Order): DeliveryEstimate | null {
  if (order.status === 'CANCELLED') return null
  const placed = new Date(order.orderDate)
  if (order.status === 'DELIVERED') {
    return { label: 'Delivered', value: formatDate(addDays(placed, 4).toISOString()) }
  }
  const eta = addDays(placed, order.status === 'SHIPPED' ? 2 : 5)
  return { label: 'Estimated delivery', value: formatDate(eta.toISOString()) }
}

export interface OrderGroup {
  key: string
  label: string
  orders: Order[]
}

const DAY_MS = 86_400_000

export function groupOrdersByDate(orders: Order[], now: Date = new Date()): OrderGroup[] {
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const groups: OrderGroup[] = []
  const index = new Map<string, OrderGroup>()

  const bucket = (key: string, label: string): OrderGroup => {
    let g = index.get(key)
    if (!g) {
      g = { key, label, orders: [] }
      index.set(key, g)
      groups.push(g)
    }
    return g
  }

  for (const order of orders) {
    const d = new Date(order.orderDate)
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const diffDays = Math.round((startOfToday - dayStart) / DAY_MS)
    let g: OrderGroup
    if (diffDays <= 0) {
      g = bucket('today', 'Today')
    } else if (diffDays === 1) {
      g = bucket('yesterday', 'Yesterday')
    } else if (diffDays <= 7) {
      g = bucket('this-week', 'This Week')
    } else {
      g = bucket(`m-${d.getFullYear()}-${d.getMonth()}`, d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))
    }
    g.orders.push(order)
  }

  groups.sort((a, b) => {
    const rank = (g: OrderGroup) =>
      g.key === 'today' ? 0 : g.key === 'yesterday' ? 1 : g.key === 'this-week' ? 2 : 3
    const ra = rank(a)
    const rb = rank(b)
    if (ra !== rb) return ra - rb
    if (ra === 3) {
      const monthTs = (g: OrderGroup) => {
        const [, y, m] = g.key.split('-')
        return Number(y) * 12 + Number(m)
      }
      return monthTs(b) - monthTs(a)
    }
    return 0
  })

  return groups
}