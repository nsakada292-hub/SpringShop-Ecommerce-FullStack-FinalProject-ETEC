import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, ArrowUpRight, DollarSign, ShoppingBag, Eye, CreditCard } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const conversionData = [
    { stage: 'Store Impressions', count: 18400 },
    { stage: 'Product Views', count: 9600 },
    { stage: 'Added to Bag', count: 2150 },
    { stage: 'Checkouts Started', count: 980 },
    { stage: 'Paid Orders', count: 684 },
  ];

  const monthlyGrowth = [
    { month: 'Apr', gross: 8400, net: 6900 },
    { month: 'May', gross: 11200, net: 9200 },
    { month: 'Jun', gross: 14800, net: 12100 },
    { month: 'Jul', gross: 17600, net: 14500 },
    { month: 'Aug', gross: 21400, net: 17900 },
    { month: 'Sep', gross: 26800, net: 22400 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Analytics & Revenue Intelligence
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          In-depth financial yield, conversion funnel analysis, and unit economics.
        </p>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Average Order Value (AOV)</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">$142.80</p>
          <p className="text-xs font-semibold text-[#00e000] flex items-center gap-1 mt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8.2% vs previous quarter</span>
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Checkout Conversion Rate</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">3.72%</p>
          <p className="text-xs font-semibold text-[#009dff] flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Top 10% in Apparel category</span>
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Customer Lifetime Value (LTV)</p>
          <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mt-1">$385.00</p>
          <p className="text-xs font-semibold text-emerald-500 flex items-center gap-1 mt-1">
            <span>2.7 orders per active user</span>
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Gross vs Net Inflow */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Monthly Turnover Trajectory
              </h2>
              <p className="text-xs text-zinc-400">Gross revenue vs net post-fulfilment margin</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#888888' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
                />
                <Bar dataKey="gross" fill="#009dff" radius={[6, 6, 0, 0]} name="Gross Turnover" />
                <Bar dataKey="net" fill="#00e000" radius={[6, 6, 0, 0]} name="Net Margin" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* E-Commerce Funnel */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Buyer Journey Funnel
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Drop-off velocity at each conversion stage</p>
          </div>

          <div className="space-y-3 my-4">
            {conversionData.map((item, idx) => {
              const max = conversionData[0].count;
              const percent = Math.round((item.count / max) * 100);
              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.stage}</span>
                    <span className="font-mono text-zinc-500">{item.count.toLocaleString()} ({percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-gradient"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-zinc-400 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            Funnel health index: <strong>Optimal</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
