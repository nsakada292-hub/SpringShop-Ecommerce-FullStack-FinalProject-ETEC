import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Order } from '../../types';
import { orderApi } from '../../api/orderApi';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Spinner';
import {
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  Printer,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

export const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        const data = await orderApi.getById(Number(orderId));
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Loading order receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Order Not Found</h2>
        <p className="text-xs text-zinc-400 mt-2 mb-6">Could not retrieve details for this order ID.</p>
        <Link to="/" className="btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-semibold">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Celebration Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="text-center space-y-3"
      >
        <div className="w-16 h-16 rounded-full bg-[#4ce600]/15 text-[#00e000] flex items-center justify-center mx-auto shadow-lg ring-8 ring-[#4ce600]/10">
          <CheckCircle className="w-10 h-10" />
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00e1ff]/15 text-[#009dff] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Payment Verified & Confirmed</span>
        </span>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Thank you for your order!
        </h1>
        <p className="text-xs text-zinc-500 max-w-md mx-auto">
          We have received order <strong className="text-zinc-800 dark:text-zinc-200">#{order.id}</strong>. A receipt and shipment tracker has been sent to your email.
        </p>
      </motion.div>

      {/* Receipt Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <p className="text-xs text-zinc-400">Order Number</p>
            <p className="text-lg font-mono font-bold text-zinc-900 dark:text-zinc-100">
              #{order.id}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={order.status === 'DELIVERED' ? 'success' : 'info'}>
              {order.status}
            </Badge>
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Purchased Items List */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            Items in this Shipment
          </h3>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {order.items.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                    alt={item.productName}
                    className="w-12 h-14 object-cover rounded-lg bg-zinc-100 dark:bg-zinc-800"
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

        {/* Shipping & Payment Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#009dff]" />
              <span>Shipping Address</span>
            </p>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{order.shippingAddress?.fullName}</p>
            <p className="text-zinc-500">{order.shippingAddress?.street}</p>
            <p className="text-zinc-500">{order.shippingAddress?.city}, Cambodia</p>
            <p className="text-zinc-500">Phone: {order.shippingAddress?.phone}</p>
          </div>

          <div className="space-y-1">
            <p className="font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#00e000]" />
              <span>Payment Details</span>
            </p>
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">{order.paymentMethod}</p>
            <p className="text-zinc-500">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
            <p className="text-sm font-black text-[#009dff] pt-2">
              Total Paid: ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Action Links */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/orders/me"
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-center hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          View All My Orders
        </Link>
        <Link
          to="/"
          className="btn-primary-gradient w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
