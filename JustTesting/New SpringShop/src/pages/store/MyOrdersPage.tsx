import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '../../types';
import { orderApi } from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import { Button } from '../../components/common/Button';
import { Package, ArrowRight, Calendar, CreditCard } from 'lucide-react';

export const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const data = await orderApi.getMyOrders();
        setOrders(data);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Loading your order history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          My Purchase History
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Track shipments, review past invoices, and browse previous orders.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No orders found</h3>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto mb-6">
            You have not placed any orders with this account yet.
          </p>
          <Link to="/" className="btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-semibold">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Order #{order.id}
                  </span>
                  <Badge variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'info'}>
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">
                    Total: ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items Thumbnails */}
              <div className="flex flex-wrap items-center gap-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2.5">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                      alt={item.productName}
                      className="w-12 h-14 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800"
                    />
                    <div className="text-xs">
                      <p className="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">{item.productName}</p>
                      <p className="text-zinc-400 text-[11px]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <Link
                  to={`/order-confirmation/${order.id}`}
                  className="text-xs font-semibold text-[#009dff] hover:underline flex items-center gap-1"
                >
                  <span>View Order Receipt</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
