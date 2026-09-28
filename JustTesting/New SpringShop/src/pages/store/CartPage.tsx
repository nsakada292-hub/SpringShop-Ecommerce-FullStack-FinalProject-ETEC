import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, totalAmount, updateQuantity, removeItem, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'SPRING10') {
      setDiscountPercent(10);
      success('10% seasonal discount coupon applied successfully!');
    } else if (couponCode.toUpperCase() === 'VIP20') {
      setDiscountPercent(20);
      success('VIP 20% discount coupon applied successfully!');
    } else {
      error('Invalid promo code. Try using SPRING10 or VIP20.');
    }
  };

  const freeShippingThreshold = 75;
  const isFreeShipping = totalAmount >= freeShippingThreshold;
  const shippingRemaining = Math.max(0, freeShippingThreshold - totalAmount);
  const progressPercent = Math.min(100, (totalAmount / freeShippingThreshold) * 100);

  const discountAmount = (totalAmount * discountPercent) / 100;
  const shippingFee = totalAmount === 0 ? 0 : (isFreeShipping ? 0 : 5);
  const finalTotal = Math.max(0, totalAmount - discountAmount + shippingFee);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm mx-auto mb-8">
          Explore our new season apparel, premium leather footwear, and botanical care.
        </p>
        <Link
          to="/"
          className="btn-primary-gradient px-6 py-3 rounded-xl text-xs font-bold inline-flex items-center gap-2"
        >
          <span>Explore Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
          Shopping Bag
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Review your selected items before proceeding to checkout.
        </p>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200">
            <Truck className="w-4 h-4 text-[#00e000]" />
            {isFreeShipping ? (
              <strong className="text-[#00e000]">You've unlocked FREE Standard Delivery!</strong>
            ) : (
              <span>Add <strong>${shippingRemaining.toFixed(2)}</strong> more to qualify for <strong>FREE Delivery</strong></span>
            )}
          </span>
          <span className="text-zinc-500 font-bold">{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-gradient transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Line items list */}
        <div className="lg:col-span-8 divide-y divide-zinc-200 dark:divide-zinc-800">
          {items.map(item => (
            <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <Link to={`/product/${item.productId}`} className="w-24 h-28 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800">
                <img
                  src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/product/${item.productId}`}
                  className="text-base font-bold text-zinc-900 dark:text-zinc-100 hover:text-[#009dff] transition-colors line-clamp-1"
                >
                  {item.productName}
                </Link>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Unit Price: ${item.productPrice.toFixed(2)}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-zinc-400 hover:text-rose-500 rounded transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  ${item.subtotal.toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          <div className="pt-4 flex justify-between items-center text-xs">
            <Link to="/" className="text-[#009dff] hover:underline font-semibold">
              ← Continue Shopping
            </Link>
            <button
              type="button"
              onClick={clearCart}
              className="text-zinc-400 hover:text-rose-500 transition-colors"
            >
              Empty Bag
            </button>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Order Summary
          </h3>

          {/* Coupon Code Input */}
          <form onSubmit={handleApplyCoupon} className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Promo Code
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Try SPRING10 or VIP20"
                className="flex-1 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs uppercase font-medium outline-none focus:ring-2 focus:ring-[#009dff]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl text-xs font-bold hover:opacity-90"
              >
                Apply
              </button>
            </div>
            {discountPercent > 0 && (
              <p className="text-xs text-[#00e000] font-medium flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {discountPercent}% discount active
              </p>
            )}
          </form>

          {/* Calculation lines */}
          <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">${totalAmount.toFixed(2)}</span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-[#00b000] dark:text-[#4ce600]">
                <span>Coupon Discount ({discountPercent}%)</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Estimated Delivery</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {shippingFee === 0 ? <strong className="text-[#00e000]">FREE</strong> : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-zinc-900 dark:text-zinc-100 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <span>Grand Total</span>
              <span className="text-[#009dff]">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/checkout')}
            className="w-full py-3.5 text-sm"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-[#00e000]" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
