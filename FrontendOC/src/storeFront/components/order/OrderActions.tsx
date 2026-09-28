import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Loader2, MapPin, RotateCcw, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Order } from '@/shared/types'
import { useCart } from '@/shared/contexts/CartContext'
import { cn } from '@/shared/utils/cn'

interface OrderActionsProps {
  order: Order
  onRequestCancel?: (order: Order) => void
  stretch?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function OrderActions({ order, onRequestCancel, stretch, size = 'md', className }: OrderActionsProps) {
  const { addItem, refreshCart } = useCart()
  const navigate = useNavigate()
  const [reordering, setReordering] = useState(false)

  const sm = size === 'sm'

  const handlePay = () => navigate(`/payment/${order.id}`)
  const handleTrack = () => navigate(`/orders/${order.id}`)

  const handleReorder = async () => {
    if (reordering) return
    setReordering(true)
    try {
      await Promise.all(order.items.map((item) => addItem(item.productId, item.quantity)))
      await refreshCart()
      toast.success('Items added to your cart')
    } catch {
      toast.error('Failed to reorder. Please try again.')
    } finally {
      setReordering(false)
    }
  }

  const primaryBtn = cn(
    'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] font-bold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-300 hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:active:scale-100',
    sm ? 'px-3.5 py-1.5 text-xs' : 'px-4 py-2 text-xs',
    stretch && 'w-full'
  )
  const outlineBtn = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50',
    sm ? 'border-gray-300 px-3.5 py-1.5 text-xs dark:border-white/15' : 'border-gray-300 px-4 py-2 text-xs dark:border-white/15',
    'text-gray-700 hover:border-[#22c55e] hover:text-[#22c55e] dark:text-gray-200 dark:hover:border-[#34d399] dark:hover:text-[#34d399]',
    stretch && 'w-full'
  )
  const dangerBtn = cn(
    'inline-flex items-center justify-center gap-2 rounded-full border border-rose-300 font-semibold text-rose-600 transition-all duration-300 hover:bg-rose-50 active:scale-95 disabled:opacity-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10',
    sm ? 'px-3.5 py-1.5 text-xs' : 'px-4 py-2 text-xs',
    stretch && 'w-full'
  )
  const iconCls = sm ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <div
      className={cn(
        'flex items-center gap-2 flex-wrap',
        stretch ? 'flex-col items-stretch' : 'justify-end',
        className
      )}
    >
      {onRequestCancel && (order.status === 'PENDING' || order.status === 'PAID') && (
        <button type="button" onClick={() => onRequestCancel(order)} className={dangerBtn}>
          <Trash2 className={iconCls} />
          Cancel
        </button>
      )}

      {order.status === 'PENDING' && (
        <button
          type="button"
          onClick={handlePay}
          className={cn(primaryBtn, 'animate-pulse-glow')}
        >
          <CreditCard className={iconCls} />
          Pay Now
        </button>
      )}

      {(order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
        <button type="button" onClick={handleTrack} className={primaryBtn}>
          <MapPin className={iconCls} />
          Track Order
        </button>
      )}

      {order.status !== 'PENDING' && (
        <button
          type="button"
          onClick={handleReorder}
          disabled={reordering}
          className={cn(order.status === 'DELIVERED' ? primaryBtn : outlineBtn, order.status === 'CANCELLED' && primaryBtn)}
        >
          {reordering ? <Loader2 className={cn(iconCls, 'animate-spin')} /> : <RotateCcw className={iconCls} />}
          Reorder
        </button>
      )}

      </div>
  )
}