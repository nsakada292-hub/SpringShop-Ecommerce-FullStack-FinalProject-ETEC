import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader2, Package, SearchX, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Order } from '@/shared/types'
import { ordersApi } from '@/shared/api/orders.api'
import { productsApi } from '@/shared/api/products.api'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useCart } from '@/shared/contexts/CartContext'
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog'
import {
  ORDER_FILTERS,
  groupOrdersByDate,
  matchesFilter,
  type OrderFilter,
  type OrderView,
} from '@/storeFront/components/order/order-utils'
import { OrderToolbar } from '@/storeFront/components/order/OrderToolbar'
import { OrderGroupSection } from '@/storeFront/components/order/OrderViews'

type FilterCounts = Record<OrderFilter, number>

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth()
  const { refreshCart } = useCart()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<OrderFilter>('all')
  const [view, setView] = useState<OrderView>(() => {
    const saved = localStorage.getItem('orders-view')
    if (saved === 'list' || saved === 'grid' || saved === 'accordion') return saved
    return 'list'
  })
  const [productImages, setProductImages] = useState<Record<number, string>>({})
  const [confirmOrder, setConfirmOrder] = useState<Order | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    let active = true
    setOrders([])
    setError(false)
    if (!isAuthenticated) {
      setIsLoading(false)
      return () => {
        active = false
      }
    }
    setIsLoading(true)
    ordersApi
      .getMyOrders()
      .then(({ data }) => {
        if (active) {
          setOrders(data)
          setError(false)
        }
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
  }, [user?.id, isAuthenticated])

  useEffect(() => {
    let active = true
    productsApi
      .getAll()
      .then(({ data }) => {
        if (!active) return
        const map: Record<number, string> = {}
        for (const p of data) {
          if (p.image) map[p.id] = p.image
        }
        setProductImages(map)
      })
      .catch(() => {
        // images are optional; gradient placeholders are used as fallback
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('orders-view', view)
  }, [view])

  const getImage = useCallback((productId: number) => productImages[productId], [productImages])

  const counts = useMemo<FilterCounts>(() => {
    const c: FilterCounts = { all: orders.length, pending: 0, processing: 0, completed: 0, cancelled: 0 }
    for (const order of orders) {
      if (order.status === 'PENDING') c.pending += 1
      else if (order.status === 'PAID' || order.status === 'SHIPPED') c.processing += 1
      else if (order.status === 'DELIVERED') c.completed += 1
      else if (order.status === 'CANCELLED') c.cancelled += 1
    }
    return c
  }, [orders])

  const filteredOrders = useMemo(
    () =>
      orders
        .filter((o) => matchesFilter(o, filter))
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()),
    [orders, filter]
  )

  const groups = useMemo(() => groupOrdersByDate(filteredOrders), [filteredOrders])

  const handleRequestCancel = useCallback((order: Order) => setConfirmOrder(order), [])

  const handleConfirmCancel = async () => {
    if (!confirmOrder) return
    setCancelling(true)
    try {
      await ordersApi.cancel(confirmOrder.id)
      setOrders((prev) => prev.map((o) => (o.id === confirmOrder.id ? { ...o, status: 'CANCELLED' } : o)))
      setConfirmOrder(null)
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
      <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-4 pt-24">
        <Loader2 className="h-10 w-10 animate-spin text-[#22c55e] dark:text-[#34d399]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-4 pt-24 text-center">
        <Package className="mb-4 h-14 w-14 text-gray-300 dark:text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Failed to load orders</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Something went wrong. Please try again later.</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 pt-24 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-[#22c55e] dark:text-[#34d399]">
          <Package className="h-11 w-11" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">No orders yet</h1>
        <p className="mt-2 max-w-md text-gray-500 dark:text-gray-400">
          You haven't placed any orders yet. Explore our latest collection and place your first order today!
        </p>
        <Link
          to="/category"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:brightness-110 active:scale-95"
        >
          <ShoppingBag className="h-4 w-4" />
          Start Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#34d399] to-[#22c55e] text-white shadow-lg shadow-[#22c55e]/25">
              <Package className="h-6 w-6" />
            </span>
            My Orders
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-400">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Track shipments, complete pending payments and reorder your favourites — all in one place.
          </p>
        </div>
      </div>

      {/* Sticky toolbar */}
      <div className="sticky top-16 z-20 -mx-4 px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <OrderToolbar
          filter={filter}
          onFilterChange={setFilter}
          view={view}
          onViewChange={setView}
          counts={counts}
          filteredCount={filteredOrders.length}
          totalCount={orders.length}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 p-10 text-center dark:border-white/10">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-500">
            <SearchX className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            No {filter === 'all' ? 'orders' : ORDER_FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} orders found
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            {filter === 'all'
              ? 'There are no orders in this view yet.'
              : 'Try another status tab or clear the filter to see all your orders.'}
          </p>
          {filter !== 'all' && (
            <button
              type="button"
              onClick={() => setFilter('all')}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-300 hover:brightness-110 active:scale-95"
            >
              View all orders
            </button>
          )}
        </div>
      ) : (
        groups.map((group) => (
          <OrderGroupSection
            key={group.key}
            group={group}
            view={view}
            getImage={getImage}
            onRequestCancel={handleRequestCancel}
          />
        ))
      )}

      <ConfirmDialog
        isOpen={confirmOrder !== null}
        title="Cancel this order?"
        message={`Are you sure you want to cancel order #${confirmOrder?.orderNumber ?? confirmOrder?.id ?? ''}? This action cannot be undone.`}
        confirmLabel="Yes, cancel order"
        onConfirm={handleConfirmCancel}
        onCancel={() => setConfirmOrder(null)}
        isLoading={cancelling}
      />
    </div>
  )
}