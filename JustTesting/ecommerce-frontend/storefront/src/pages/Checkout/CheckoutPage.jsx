import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { placeOrder } from "../../services/orderService";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Alert from "../../components/common/Alert";
import Card from "../../components/common/Card";
import PriceTag from "../../components/common/PriceTag";
import { getErrorMessage } from "../../utils/helpers";

export default function CheckoutPage() {
  const { isAuthenticated } = useAuth();
  const { items, totalPrice } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const shippingAddress = [
    form.fullName,
    [form.addressLine1, form.addressLine2].filter(Boolean).join(", "),
    [form.city, form.postalCode].filter(Boolean).join(" "),
    form.country,
  ]
    .filter(Boolean)
    .join(", ");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!shippingAddress) {
      setError("Please fill in your shipping details");
      return;
    }
    setLoading(true);
    try {
      const res = await placeOrder(shippingAddress);
      setOrderId(res.data?.id ?? res.data?.orderId ?? "placed");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    const redirect = encodeURIComponent("/checkout");
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          Checkout
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Please sign in to complete your order.
        </p>
        <Card shape="lg">
          {items.length > 0 ? (
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {item.name} × {item.quantity}
                  </span>
                  <PriceTag value={item.price * item.quantity} />
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t border-slate-100 dark:border-slate-700 pt-3">
                <span>Total</span>
                <PriceTag value={totalPrice} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 my-4">Your bag is empty.</p>
          )}
          <Link
            to={`/sign-in?redirect=${redirect}`}
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-lagoon-gradient rounded-lg hover:opacity-90"
          >
            Sign in to Checkout
          </Link>
        </Card>
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-brand.limeGreen/20 flex items-center justify-center">
          <svg className="h-8 w-8 text-brand.limeGreen" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Order placed
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Your order #{orderId} has been received. We'll ship it soon.
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={() => navigate("/orders")}>View Orders</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          {error && <Alert>{error}</Alert>}
          <Card shape="lg" className="space-y-4">
            <h2 className="text-lg font-semibold">Shipping details</h2>
            <Input id="co-name" label="Full Name" value={form.fullName} onChange={set("fullName")} required placeholder="Jane Doe" />
            <Input id="co-phone" label="Phone" value={form.phone} onChange={set("phone")} required placeholder="+1 555 000 0000" />
            <Input id="co-addr1" label="Address" value={form.addressLine1} onChange={set("addressLine1")} required placeholder="Street address" />
            <Input id="co-addr2" label="Apt / Suite (optional)" value={form.addressLine2} onChange={set("addressLine2")} placeholder="Apt, suite, unit…" />
            <div className="grid grid-cols-2 gap-4">
              <Input id="co-city" label="City" value={form.city} onChange={set("city")} required />
              <Input id="co-zip" label="Postal Code" value={form.postalCode} onChange={set("postalCode")} required />
            </div>
            <Input id="co-country" label="Country" value={form.country} onChange={set("country")} required />
          </Card>

          <Button type="submit" className="w-full justify-center" size="lg" loading={loading} disabled={items.length === 0}>
            Place Order · <PriceTag value={totalPrice} />
          </Button>
        </form>

        <Card shape="lg" className="lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold mb-4">Order summary</h2>
          {items.length === 0 ? (
            <p className="text-sm text-slate-400">
              Your bag is empty.{" "}
              <Link to="/category/women" className="text-brand.blue dark:text-brand.aqua">
                Browse products
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-slate-700 dark:text-slate-300 truncate">
                    {item.name} × {item.quantity}
                  </span>
                  <PriceTag value={item.price * item.quantity} className="shrink-0" />
                </div>
              ))}
              <div className="flex justify-between font-semibold border-t border-slate-100 dark:border-slate-700 pt-3">
                <span>Total</span>
                <PriceTag value={totalPrice} />
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}