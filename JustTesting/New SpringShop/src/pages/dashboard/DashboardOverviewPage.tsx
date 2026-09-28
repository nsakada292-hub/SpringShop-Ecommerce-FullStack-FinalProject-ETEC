import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardStats, Order, Product } from '../../types';
import { dashboardApi } from '../../api/dashboardApi';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Package,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export const DashboardOverviewPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const data = await dashboardApi.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Loading admin metrics...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Overview & Telemetry
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time business performance, inventory alerts, and order logistics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/products"
            className="btn-primary-gradient px-4 py-2 rounded-xl text-xs font-semibold shadow-xs"
          >
            + Add New Product
          </Link>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Revenue</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] font-semibold text-[#00e000] flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% from last month</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#4ce600]/15 text-[#00e000] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Orders</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {stats.totalOrders}
            </p>
            <p className="text-[11px] font-semibold text-[#009dff] flex items-center gap-1 mt-1">
              <span>98.2% fulfillment rate</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#00e1ff]/15 text-[#009dff] flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Registered Users</p>
            <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">
              {stats.totalCustomers}
            </p>
            <p className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 mt-1">
              <span>+6 new today</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/15 text-sky-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Low Stock Alerts</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {stats.lowStockProducts.length} items
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">
              Requires restock PO
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recharts Data Visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Growth Trend Area Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Revenue Inflow Trend
              </h2>
              <p className="text-xs text-zinc-400">Daily gross turnover (trailing 7 days)</p>
            </div>
            <span className="text-xs font-bold text-[#009dff] bg-[#00e1ff]/10 px-2.5 py-1 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#009dff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#009dff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#009dff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Bar Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Department Sales Distribution
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Orders volume by top collection</p>
          </div>

          <div className="h-56 w-full my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categorySalesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="sales" fill="#00e000" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-xs text-zinc-500">
            <span>Women leads in volume</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">54% share</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table & Low Stock Alert List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Recent Customer Orders
            </h2>
            <Link to="/admin/orders" className="text-xs text-[#009dff] hover:underline font-semibold">
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Items</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {stats.recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      #{order.id}
                    </td>
                    <td className="py-3 text-zinc-700 dark:text-zinc-300">
                      {order.shippingAddress?.fullName || 'Customer'}
                    </td>
                    <td className="py-3 text-zinc-500">
                      {order.items.length} items
                    </td>
                    <td className="py-3 font-bold text-zinc-900 dark:text-zinc-100">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3">
                      <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'info'} size="sm">
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Inventory Thresholds</span>
            </h2>
            <Link to="/admin/products" className="text-xs text-[#009dff] hover:underline font-semibold">
              Manage Stock →
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stats.lowStockProducts.map(p => (
              <div key={p.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={p.image}
                    alt={p.productName}
                    className="w-10 h-10 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0"
                  />
                  <div>
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[160px]">
                      {p.productName}
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      {p.category.categoryName} • ${p.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {p.stockQuantity} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
