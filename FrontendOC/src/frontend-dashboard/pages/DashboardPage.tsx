import { useState, useEffect, useMemo } from 'react'
import {
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { cn, formatPrice, formatDate } from '@/shared/utils/cn'
import { productsApi } from '@/shared/api/products.api'
import { ordersApi } from '@/shared/api/orders.api'
import { categoriesApi } from '@/shared/api/categories.api'
import { usersApi } from '@/shared/api/users.api'
import type { Product, Order } from '@/shared/types'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Badge } from '@/shared/components/ui/Badge'

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  gradient: string
  loading: boolean
}

function StatCard({ icon, label, value, gradient, loading }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 hover:border-surface-300 dark:hover:border-surface-700 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn('flex items-center justify-center w-12 h-12 rounded-xl', gradient)}>
          {icon}
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-7 w-16 mb-1" />
          ) : (
            <p className="text-2xl font-bold text-surface-900 dark:text-white">{value}</p>
          )}
          <p className="text-sm text-surface-500 dark:text-surface-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

function orderStatusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return <Badge variant="warning">{status}</Badge>
    case 'PAID':
      return <Badge variant="info">{status}</Badge>
    case 'SHIPPED':
      return <Badge variant="info">{status}</Badge>
    case 'DELIVERED':
      return <Badge variant="success">{status}</Badge>
    case 'CANCELLED':
      return <Badge variant="danger">{status}</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-surface-900 dark:text-white">{formatPrice(payload[0].value)}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categoriesCount, setCategoriesCount] = useState(0)
  const [customersCount, setCustomersCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [productsRes, ordersRes, categoriesRes, usersRes] = await Promise.allSettled([
        productsApi.getAll(),
        ordersApi.getAll(),
        categoriesApi.getAll(),
        usersApi.getAll(),
      ])
      if (productsRes.status === 'fulfilled') setProducts(productsRes.value.data)
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data)
      if (categoriesRes.status === 'fulfilled') setCategoriesCount(categoriesRes.value.data.length)
      if (usersRes.status === 'fulfilled') setCustomersCount(usersRes.value.data.length)
      setLoading(false)
    }
    load()
  }, [])

  const chartData = useMemo(() => {
    if (!orders.length) return []
    const byDate = new Map<string, number>()
    orders.forEach((o) => {
      const date = o.orderDate?.slice(0, 10) ?? 'Unknown'
      byDate.set(date, (byDate.get(date) ?? 0) + o.totalAmount)
    })
    return Array.from(byDate.entries())
      .map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
  }, [orders])

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stockQuantity < 10),
    [products]
  )

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => (b.orderDate ?? '').localeCompare(a.orderDate ?? '')).slice(0, 5),
    [orders]
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package size={22} className="text-white" />}
          label="Total Products"
          value={products.length}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          loading={loading}
        />
        <StatCard
          icon={<ShoppingCart size={22} className="text-white" />}
          label="Total Orders"
          value={orders.length}
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          loading={loading}
        />
        <StatCard
          icon={<FolderTree size={22} className="text-white" />}
          label="Categories"
          value={categoriesCount}
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          loading={loading}
        />
        <StatCard
          icon={<Users size={22} className="text-white" />}
          label="Customers"
          value={customersCount}
          gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-brand-aqua" />
            <h2 className="text-base font-semibold text-surface-900 dark:text-white">Revenue Over Time</h2>
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-surface-500 text-sm">
              No sales data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--chart-axis)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis
                  stroke="var(--chart-axis)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#34d399"
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-base font-semibold text-surface-900 dark:text-white">Low Stock Alerts</h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <p className="text-sm text-surface-500 py-8 text-center">All products well stocked</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {lowStockProducts.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800/50 hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-surface-900 dark:text-white truncate">{p.productName}</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">{p.category?.categoryName}</p>
                  </div>
                  <Badge variant={p.stockQuantity === 0 ? 'danger' : 'warning'}>
                    {p.stockQuantity === 0 ? 'Out of stock' : `${p.stockQuantity} left`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-surface-900 dark:text-white mb-4">Latest Orders</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-sm text-surface-500 py-8 text-center">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider pb-3 px-4">Order</th>
                  <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider pb-3 px-4">Customer</th>
                  <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider pb-3 px-4">Date</th>
                  <th className="text-right text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider pb-3 px-4">Amount</th>
                  <th className="text-center text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider pb-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-surface-200 dark:border-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-surface-900 dark:text-white">#{o.id}</td>
                    <td className="py-3 px-4 text-sm text-surface-600 dark:text-surface-300">User #{o.userId}</td>
                    <td className="py-3 px-4 text-sm text-surface-500 dark:text-surface-400">{o.orderDate ? formatDate(o.orderDate) : '-'}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-surface-900 dark:text-white text-right">{formatPrice(o.totalAmount)}</td>
                    <td className="py-3 px-4 text-center">{orderStatusBadge(o.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
