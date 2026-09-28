import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, MapPin, Phone, Mail, User as UserIcon, ExternalLink, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice, formatDate } from '@/shared/utils/cn'
import { ordersApi } from '@/shared/api/orders.api'
import { usersApi } from '@/shared/api/users.api'
import type { Order, OrderStatus, User } from '@/shared/types'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Modal } from '@/shared/components/ui/Modal'

const PAGE_SIZE = 8

const allStatuses: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const statusColorMap: Record<OrderStatus, string> = {
  PENDING: 'text-amber-500 bg-amber-500/15 border-amber-500/25',
  PAID: 'text-brand-aqua bg-brand-aqua/15 border-brand-aqua/25',
  SHIPPED: 'text-brand-aqua bg-brand-aqua/15 border-brand-aqua/25',
  DELIVERED: 'text-brand-green bg-brand-green/15 border-brand-green/25',
  CANCELLED: 'text-red-400 bg-red-500/15 border-red-500/25',
}

export default function OrderPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const userName = (userId: number): string => {
    const u = users.find((x) => x.id === userId)
    return u ? u.name : `User #${userId}`
  }

  const fetchData = async () => {
    setLoading(true)
    const [ordersRes, usersRes] = await Promise.allSettled([
      ordersApi.getAll(),
      usersApi.getAll(),
    ])
    if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data)
    if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) => {
      const u = users.find((x) => x.id === o.userId)
      const name = u ? u.name : `User #${o.userId}`
      return String(o.id).includes(q) || name.toLowerCase().includes(q)
    })
  }, [orders, search, users])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    if (order.status === newStatus) return
    setUpdatingId(order.id)
    try {
      await ordersApi.updateStatus(order.id, newStatus)
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
      )
      toast.success(`Order #${order.id} marked as ${newStatus.toLowerCase()}`)
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? 'Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Orders</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Manage and track customer orders</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type="text"
          placeholder="Search by ID or customer..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-aqua/30 focus:border-brand-aqua transition-all"
        />
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-800">
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Order</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Customer</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Date</th>
                    <th className="text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Items</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Total</th>
                    <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Status</th>
                    <th className="text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o) => (
                    <tr key={o.id} className="border-b border-surface-200 dark:border-surface-800/50 last:border-0 hover:bg-surface-100 dark:hover:bg-surface-800/30 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-surface-900 dark:text-white">#{o.id}</td>
                      <td className="py-3 px-4 text-sm text-surface-600 dark:text-surface-300">{userName(o.userId)}</td>
                      <td className="py-3 px-4 text-sm text-surface-500 dark:text-surface-400">{o.orderDate ? formatDate(o.orderDate) : '-'}</td>
                      <td className="py-3 px-4 text-center text-sm text-surface-600 dark:text-surface-300">{o.items?.length ?? 0}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-surface-900 dark:text-white">{formatPrice(o.totalAmount)}</td>
                      <td className="py-3 px-4">
                        <select
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={(e) => handleStatusChange(o, e.target.value as OrderStatus)}
                          className={cnSelect(o.status, updatingId === o.id)}
                        >
                          {allStatuses.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(o)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:border-brand-aqua/50 hover:text-brand-aqua hover:bg-brand-aqua/5 transition-colors"
                        >
                          <Eye size={13} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-surface-500 dark:text-surface-400 text-sm">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-800">
                <p className="text-sm text-surface-500 dark:text-surface-400">Page {current} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={current === 1}
                    className="p-2 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={current === totalPages}
                    className="p-2 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={selectedOrder !== null}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Order #${selectedOrder.id} — Delivery Details` : ''}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="flex items-start gap-3 rounded-xl border border-surface-200 dark:border-surface-700 p-3">
                <UserIcon className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-surface-500">Recipient</p>
                  <p className="truncate text-sm font-semibold text-surface-900 dark:text-white">{selectedOrder.recipientName || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-surface-200 dark:border-surface-700 p-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-surface-500">Phone</p>
                  <p className="truncate text-sm font-semibold text-surface-900 dark:text-white">{selectedOrder.recipientPhone || '-'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-surface-200 dark:border-surface-700 p-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-surface-500">Email</p>
                  <p className="truncate text-sm font-semibold text-surface-900 dark:text-white">{selectedOrder.recipientEmail || '-'}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-surface-400" />
              <div>
                <p className="text-xs uppercase tracking-wider text-surface-500">Shipping Address</p>
                <p className="mt-1 whitespace-pre-line text-sm text-surface-600 dark:text-surface-300">
                  {selectedOrder.shippingAddress}
                </p>
              </div>
            </div>

            {selectedOrder.latitude !== null && selectedOrder.latitude !== undefined &&
              selectedOrder.longitude !== null && selectedOrder.longitude !== undefined && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-surface-500">
                    <MapPin className="h-3.5 w-3.5" />
                    Customer Location ({selectedOrder.latitude.toFixed(6)}, {selectedOrder.longitude.toFixed(6)})
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700">
                    <iframe
                      title={`Order ${selectedOrder.id} location map`}
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedOrder.longitude - 0.008}%2C${selectedOrder.latitude - 0.008}%2C${selectedOrder.longitude + 0.008}%2C${selectedOrder.latitude + 0.008}&layer=mapnik&marker=${selectedOrder.latitude}%2C${selectedOrder.longitude}`}
                      className="h-64 w-full border-0"
                      loading="lazy"
                    />
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${selectedOrder.latitude},${selectedOrder.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-aqua transition-colors hover:brightness-110"
                  >
                    Open in Google Maps
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
          </div>
        )}
      </Modal>
    </div>
  )
}

function cnSelect(status: OrderStatus, disabled: boolean) {
  return `px-3 py-1.5 text-xs font-semibold rounded-full border appearance-none cursor-pointer transition-colors ${statusColorMap[status]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
}
