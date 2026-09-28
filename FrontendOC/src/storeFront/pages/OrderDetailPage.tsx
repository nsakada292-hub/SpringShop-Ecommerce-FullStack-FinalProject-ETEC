import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Package,
  MapPin,
  ArrowLeft,
  Trash2,
  ShoppingBag,
  Loader2,
  ChevronRight,
  PackageOpen,
  User,
  Phone,
  Mail,
  ExternalLink,
  CreditCard,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Order, OrderStatus } from '@/shared/types'
import { ordersApi } from '@/shared/api/orders.api'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useCart } from '@/shared/contexts/CartContext'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import { formatPrice, formatDateTime } from '@/shared/utils/cn'

const statusStyles: Record<OrderStatus, { className: string; dot: string; label: string }> = {
  PENDING: { className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', dot: 'bg-amber-500', label: 'Pending' },
  PAID: { className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', dot: 'bg-blue-500', label: 'Paid' },
  SHIPPED: { className: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400', dot: 'bg-cyan-500', label: 'Shipped' },
  DELIVERED: { className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', dot: 'bg-emerald-500', label: 'Delivered' },
  CANCELLED: { className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400', dot: 'bg-red-500', label: 'Cancelled' },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const style = statusStyles[status] ?? statusStyles.PENDING
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  )
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const { refreshCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let active = true
    setOrder(null)
    setError(false)
    if (!isAuthenticated) {
      setIsLoading(false)
      return () => {
        active = false
      }
    }
    if (!id) {
      setIsLoading(false)
      setError(true)
      return () => {
        active = false
      }
    }
    setIsLoading(true)
    ordersApi
      .getById(Number(id))
      .then(({ data }) => {
        if (active) setOrder(data)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, user?.id, isAuthenticated])

  const canCancel = order && (order.status === 'PENDING' || order.status === 'PAID')
  const canPay = order && order.status === 'PENDING'

  const handleCancel = async () => {
    if (!order) return
    setCancelling(true)
    try {
      await ordersApi.cancel(order.id)
      setOrder({ ...order, status: 'CANCELLED' })
      setConfirmOpen(false)
      await refreshCart()
      toast.success('Order cancelled successfully')
    } catch {
      toast.error('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 pt-24">
        <Loader2 className="h-10 w-10 animate-spin text-[#22c55e] dark:text-[#34d399]" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4 pt-24 text-center">
        <PackageOpen className="mb-4 h-14 w-14 text-gray-300 dark:text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order not found</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">This order doesn't exist or you don't have access to it.</p>
        <Link
          to="/orders"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all hover:brightness-110 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Link>
      </div>
    )
  }

  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-[#22c55e] dark:hover:text-[#34d399]">
          Home
        </Link>
        <span>/</span>
        <Link to="/orders" className="transition-colors hover:text-[#22c55e] dark:hover:text-[#34d399]">
          Orders
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900 dark:text-white">Order #{order.orderNumber ?? order.id}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Order #{order.orderNumber ?? order.id}
            </h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Placed on {formatDateTime(order.orderDate)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canPay && (
            <button
              type="button"
              onClick={() => navigate(`/payment/${order.id}`)}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-95"
            >
              <CreditCard className="h-4 w-4" />
              Pay Now
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={cancelling}
              className="inline-flex items-center gap-2 rounded-full border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-600 transition-all duration-300 hover:bg-red-50 active:scale-95 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.02]">
          <h2 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">
            Order Items <span className="text-sm font-medium text-gray-400">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
          </h2>

          <div className="hidden grid-cols-[1fr_80px_110px_110px] gap-4 border-b border-gray-200 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-white/10 dark:text-gray-400">
            <span>Product</span>
            <span className="text-center">Qty</span>
            <span className="text-center">Unit Price</span>
            <span className="text-center">Subtotal</span>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 py-4 sm:grid-cols-[1fr_80px_110px_110px]"
              >
                <Link
                  to={`/product/${item.productId}`}
                  className="group flex items-center gap-3"
                >
                  <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#34d399]/10 to-[#22c55e]/10 ring-1 ring-gray-100 dark:ring-white/5">
                    <Package className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/product/${item.productId}`}
                      className="group-hover:text-[#22c55e] text-sm font-semibold text-gray-900 transition-colors dark:text-white dark:group-hover:text-[#34d399]"
                    >
                      {item.productName}
                    </Link>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 sm:hidden">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                </Link>
                <span className="text-center text-sm text-gray-600 dark:text-gray-300">{item.quantity}</span>
                <span className="hidden text-center text-sm text-gray-600 dark:text-gray-300 sm:block">{formatPrice(item.unitPrice)}</span>
                <span className="hidden text-right text-sm font-bold text-gray-900 dark:text-white sm:block">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit space-y-6 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.02]">
            <h2 className="mb-5 text-lg font-bold text-gray-900 dark:text-white">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>Total ({itemCount} items)</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-3 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Order Total</span>
                  <span className="bg-gradient-to-r from-[#34d399] to-[#22c55e] bg-clip-text text-xl font-bold text-transparent">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.02]">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-[#22c55e] dark:text-[#34d399]">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delivery Details</h2>
            </div>

            <div className="space-y-3 text-sm">
              {order.recipientName && (
                <div className="flex items-start gap-3">
                  <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Recipient</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.recipientName}</p>
                  </div>
                </div>
              )}
              {order.recipientEmail && (
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.recipientEmail}</p>
                  </div>
                </div>
              )}
              {order.recipientPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{order.recipientPhone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 pt-1">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Shipping Address</p>
                  <p className="mt-0.5 whitespace-pre-line leading-relaxed text-gray-600 dark:text-gray-400">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>
            </div>

            {order.latitude !== null && order.latitude !== undefined && order.longitude !== null && order.longitude !== undefined && (
              <div className="mt-5">
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
                  <iframe
                    title="Delivery location map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${order.longitude - 0.008}%2C${order.latitude - 0.008}%2C${order.longitude + 0.008}%2C${order.latitude + 0.008}&layer=mapnik&marker=${order.latitude}%2C${order.longitude}`}
                    className="h-56 w-full border-0"
                    loading="lazy"
                  />
                </div>
                <a
                  href={`https://www.google.com/maps?q=${order.latitude},${order.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#22c55e] transition-colors hover:text-[#16a34a] dark:text-[#34d399] dark:hover:text-[#4ade80]"
                >
                  Open in Google Maps
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>

          <Link
            to="/orders"
            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[#34d399] hover:text-[#22c55e] dark:border-white/15 dark:text-gray-200 dark:hover:border-[#34d399] dark:hover:text-[#34d399]"
          >
            <ShoppingBag className="h-4 w-4" />
            View All Orders
            <ChevronRight className="h-4 w-4" />
          </Link>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Cancel this order?"
        message={`Are you sure you want to cancel order #${order.orderNumber ?? order.id}? This action cannot be undone.`}
        confirmLabel="Yes, cancel order"
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
        isLoading={cancelling}
      />
    </div>
  )
}
