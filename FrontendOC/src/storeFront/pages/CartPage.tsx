import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, ShoppingCart, X, Truck, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import type { CartItem } from '@/shared/types'
import { useCart } from '@/shared/contexts/CartContext'
import { formatPrice } from '@/shared/utils/cn'

export default function CartPage() {
  const { items, itemCount, totalAmount, updateQuantity, removeItem, isLoading } = useCart()
  const navigate = useNavigate()
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const handleUpdateQuantity = async (item: CartItem, qty: number) => {
    if (qty < 1) return
    setUpdatingId(item.id)
    try {
      await updateQuantity(item.id, qty)
    } catch {
      toast.error('Failed to update quantity')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (item: CartItem) => {
    try {
      await removeItem(item.id)
      toast.success('Item removed from cart')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const shipping = totalAmount >= 100 || totalAmount === 0 ? 0 : 10
  const tax = totalAmount * 0.1

  if (isLoading && items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex animate-pulse gap-4 rounded-2xl bg-white p-4 dark:bg-white/5">
                <div className="h-24 w-20 rounded-xl bg-surface-200 dark:bg-surface-800" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/2 rounded bg-surface-200 dark:bg-surface-800" />
                  <div className="h-4 w-1/4 rounded bg-surface-200 dark:bg-surface-800" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-64 animate-pulse rounded-2xl bg-surface-200 dark:bg-surface-800" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 pt-24 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-[#22c55e] dark:text-[#34d399]">
          <ShoppingBag className="h-11 w-11" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Your cart is empty</h1>
        <p className="mt-2 max-w-md text-gray-500 dark:text-gray-400">
          Looks like you haven't added anything to your bag yet. Discover our latest
          arrivals and find something you love.
        </p>
        <Link
          to="/category"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-95"
        >
          Start Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <h1 className="mb-8 flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
        <ShoppingBag className="h-8 w-8 text-[#22c55e] dark:text-[#34d399]" />
        Shopping Cart
        <span className="text-lg font-medium text-gray-400">({itemCount} items)</span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Cart items */}
        <div className="space-y-4">
          <div className="hidden grid-cols-[1fr_80px_100px_100px_40px] gap-4 border-b border-gray-200 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-white/10 dark:text-gray-400 sm:grid">
            <span>Product</span>
            <span className="text-center">Price</span>
            <span className="text-center">Quantity</span>
            <span className="text-center">Subtotal</span>
            <span />
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition-shadow hover:shadow-md dark:bg-white/5 dark:ring-white/5 sm:grid-cols-[1fr_80px_100px_100px_40px] sm:p-5"
            >
              {/* Product */}
              <Link
                to={`/product/${item.productId}`}
                className="col-span-2 flex items-center gap-4 sm:col-span-1"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#34d399]/10 to-[#22c55e]/10 ring-1 ring-gray-100 dark:ring-white/5">
                  <div className="flex h-full w-full items-center justify-center">
                    <ShoppingCart className="h-7 w-7 text-gray-300 dark:text-gray-600" />
                  </div>
                  <span className="absolute inset-0 flex items-center justify-center bg-white/5 text-center text-[9px] leading-tight text-gray-400 dark:text-gray-500">
                    {item.productName}
                  </span>
                </div>
                <div className="min-w-0">
                  <Link
                    to={`/product/${item.productId}`}
                    className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors hover:text-[#22c55e] dark:text-white dark:hover:text-[#34d399]"
                  >
                    {item.productName}
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(item)}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-500 transition-colors hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </Link>

              {/* Price (desktop) */}
              <span className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block sm:text-center">
                {formatPrice(item.productPrice)}
              </span>

              {/* Quantity stepper */}
              <div className="col-start-1 row-start-2 sm:col-auto sm:row-auto">
                <div className="flex w-fit items-center overflow-hidden rounded-full border border-gray-300 dark:border-white/15">
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updatingId === item.id}
                    aria-label="Decrease quantity"
                    className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:text-[#22c55e] disabled:opacity-40 dark:text-gray-300 dark:hover:text-[#34d399]"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                    disabled={updatingId === item.id}
                    aria-label="Increase quantity"
                    className="flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:text-[#22c55e] disabled:opacity-40 dark:text-gray-300 dark:hover:text-[#34d399]"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Subtotal */}
              <span className="text-right text-sm font-bold text-gray-900 dark:text-white">
                {formatPrice(item.subtotal)}
              </span>

              {/* Remove (desktop) */}
              <button
                type="button"
                onClick={() => handleRemove(item)}
                aria-label={`Remove ${item.productName}`}
                className="hidden h-9 w-9 items-center justify-center justify-self-end rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 sm:flex"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/category"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-[#22c55e] dark:text-gray-300 dark:hover:text-[#34d399]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-white/10">
                <ArrowRight className="h-4 w-4 rotate-180" />
              </span>
              Continue Shopping
            </Link>
            <button
              type="button"
              onClick={() => navigate('/wishlist')}
              className="text-sm font-medium text-gray-500 transition-colors hover:text-[#22c55e] dark:text-gray-400 dark:hover:text-[#34d399]"
            >
              View wishlist
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 h-fit">
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/[0.02]">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Summary</h2>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>
                  Item count ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">{itemCount}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-[#22c55e] dark:text-[#34d399]" />
                  Shipping
                </span>
                <span className={shipping === 0 ? 'font-semibold text-emerald-500' : 'font-semibold text-gray-900 dark:text-white'}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="rounded-xl bg-[#34d399]/5 px-3 py-2 text-xs text-[#22c55e] dark:text-[#34d399]">
                  Add {formatPrice(100 - totalAmount)} more for free shipping!
                </p>
              )}
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>Tax (10%)</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(tax)}</span>
              </div>

              <div className="my-3 border-t border-dashed border-gray-200 dark:border-white/10" />

              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                <span className="bg-gradient-to-r from-[#34d399] to-[#22c55e] bg-clip-text text-2xl font-bold text-transparent">
                  {formatPrice(totalAmount + shipping + tax)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/checkout')}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-[0.98]"
            >
              <Lock className="h-4 w-4" />
              Proceed to Checkout
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Lock className="h-3 w-3" />
              Secure 256-bit SSL encrypted checkout
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
