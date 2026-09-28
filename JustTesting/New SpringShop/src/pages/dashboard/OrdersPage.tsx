import React, { useEffect, useState, useMemo } from 'react';
import { Order, OrderStatus } from '../../types';
import { orderApi } from '../../api/orderApi';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Spinner } from '../../components/common/Spinner';
import {
  Search,
  Eye,
  Printer,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle2,
  Package,
} from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (selectedStatus !== 'ALL' && order.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = order.id.toString().includes(q);
        const matchCustomer = order.shippingAddress?.fullName?.toLowerCase().includes(q);
        if (!matchId && !matchCustomer) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  const handleUpdateStatus = async (orderId: number, nextStatus: OrderStatus) => {
    setUpdatingStatus(true);
    try {
      const updated = await orderApi.updateStatus(orderId, nextStatus);
      success(`Order #${orderId} status changed to ${nextStatus}`);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      fetchOrders();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const statusTabs = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
            Order Fulfillment
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Track customer shipments, invoices, payment status, and dispatch pipeline.
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        {statusTabs.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setSelectedStatus(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedStatus === tab
                ? 'bg-brand-gradient text-zinc-950 font-extrabold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, order #..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-[#009dff] focus:bg-white dark:focus:bg-zinc-900 rounded-xl outline-none"
          />
        </div>
        <span className="text-xs text-zinc-400 ml-auto">
          Showing <strong>{filteredOrders.length}</strong> orders
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
            <p className="mt-3 text-xs text-zinc-400">Loading order records...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-zinc-400">
            No orders found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/40 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Date Placed</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      #{order.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {order.shippingAddress?.fullName || 'Customer'}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {order.shippingAddress?.city || 'Cambodia'}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-zinc-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-black text-zinc-900 dark:text-zinc-100">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {order.paymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={order.status === 'DELIVERED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'info'}
                        size="sm"
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsDetailOpen(true);
                        }}
                        className="text-xs py-1 px-2.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Order #${selectedOrder.id} — Fulfillment Inspector`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Status Changer Bar */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Update Delivery Status
                </span>
                <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">
                  Current: <strong className="text-[#009dff]">{selectedOrder.status}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedOrder.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value as OrderStatus)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-[#009dff]"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="Print Invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Line Items List */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Purchased Line Items
              </h3>
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-48 overflow-y-auto">
                {selectedOrder.items.map(item => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                        alt={item.productName}
                        className="w-10 h-12 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800"
                      />
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.productName}</p>
                        <p className="text-zinc-400 text-[11px]">${item.productPrice.toFixed(2)} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recipient & Payment Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl space-y-1">
                <span className="font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#009dff]" />
                  Shipping Destination
                </span>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-zinc-500">{selectedOrder.shippingAddress?.street}</p>
                <p className="text-zinc-500">{selectedOrder.shippingAddress?.city}, Cambodia</p>
                <p className="text-zinc-500">Contact: {selectedOrder.shippingAddress?.phone}</p>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl space-y-1">
                <span className="font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <CreditCard className="w-3 h-3 text-[#00e000]" />
                  Financial Summary
                </span>
                <p className="text-zinc-500">Gateway: <strong>{selectedOrder.paymentMethod}</strong></p>
                <p className="text-zinc-500">Order Placed: {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                <p className="text-base font-black text-[#009dff] pt-2">
                  Total Paid: ${selectedOrder.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close Inspector
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
