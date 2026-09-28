import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getMyOrders, cancelOrder } from "../../services/orderService";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";
import PriceTag from "../../components/common/PriceTag";
import { orderStatusMeta } from "../../utils/helpers";

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyOrders();
      setOrders(res.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
    else {
      setLoading(false);
      setOrders([]);
    }
  }, [isAuthenticated, load]);

  const handleCancel = async (order) => {
    setCancellingId(order.id);
    try {
      await cancelOrder(order.id);
      await load();
    } catch {
      // fall through; reload to reflect server truth
    } finally {
      setCancellingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Orders
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Please sign in to view your orders.
        </p>
        <Link
          to="/sign-in"
          className="inline-block px-6 py-3 text-sm font-medium text-white bg-lagoon-gradient rounded-lg hover:opacity-90"
        >
          Sign in
        </Link>
      </div>
    );
  }

  const itemsOf = (order) => {
    const raw = order.orderItems || order.items || [];
    return raw.map((it) => ({
      id: it.id,
      name: it.productName || it.product?.name || "Product",
      quantity: it.quantity,
      price: Number(it.productPrice ?? it.price ?? order.totalAmount ?? 0),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
        Orders
      </h1>

      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" description="When you place an order it will show up here.">
          <Link
            to="/category/women"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-lagoon-gradient rounded-lg hover:opacity-90"
          >
            Start Shopping
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const meta = orderStatusMeta(order.status);
            const orderId = order.id ?? order.orderId;
            const items = itemsOf(order);
            return (
              <div
                key={orderId}
                className="rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Order #{orderId}
                    </p>
                    {order.createdAt && (
                      <p className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge color={meta.color}>{meta.label}</Badge>
                </div>

                {order.shippingAddress && (
                  <p className="text-xs text-slate-400 mb-3">
                    Ship to: {order.shippingAddress}
                  </p>
                )}

                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        {item.name} × {item.quantity}
                      </span>
                      <PriceTag value={item.price * item.quantity} />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    Total
                  </span>
                  <PriceTag value={order.totalAmount} className="font-semibold" />
                </div>

                {order.status === "PENDING" && (
                  <button
                    onClick={() => handleCancel(order)}
                    disabled={cancellingId === order.id}
                    className="mt-4 text-sm text-red-500 hover:underline disabled:opacity-50"
                  >
                    Cancel order
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}