import { useEffect, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Minus, Plus, Trash2, ShoppingBag, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDrawer } from '@/shared/contexts/DrawerContext'
import { useCart } from '@/shared/contexts/CartContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import { formatPrice } from '@/shared/utils/cn'

export default function CartDrawer() {
  const { isCartOpen, closeCart } = useDrawer()
  const { items, totalAmount, itemCount, updateQuantity, removeItem, isLoading } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    if (isCartOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isCartOpen, closeCart])

  const handleGoCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  const handleViewBag = () => {
    closeCart()
    navigate('/cart')
  }

  const handleUpdateQty = async (cartItemId: number, currentQty: number, delta: number) => {
    const next = currentQty + delta
    if (next <= 0) {
      try {
        await removeItem(cartItemId)
        toast.success('Item removed from bag')
      } catch {
        toast.error('Failed to update bag')
      }
      return
    }
    try {
      await updateQuantity(cartItemId, next)
    } catch {
      toast.error('Failed to update quantity')
    }
  }

  const handleRemove = async (cartItemId: number) => {
    try {
      await removeItem(cartItemId)
      toast.success('Item removed from bag')
    } catch {
      toast.error('Failed to remove item')
    }
  }

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeCart()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isCartOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        onKeyDown={keyHandler}
        className={`fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#111114] ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#22c55e]" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Your Bag
              {itemCount > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-400 dark:text-gray-500">
                  ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {!isAuthenticated ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-white/5">
              <Lock className="h-7 w-7 text-gray-400 dark:text-gray-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Please sign in to view your bag
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Sign in to see the items you've added and manage your checkout.
              </p>
            </div>
            <Link
              to="/sign-in"
              onClick={closeCart}
              className="rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/40 hover:brightness-110"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={closeCart}
              className="text-sm text-gray-400 underline-offset-4 transition-colors hover:text-gray-600 dark:hover:text-gray-300"
            >
              Continue browsing
            </button>
          </div>
        ) : isLoading && items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#22c55e] dark:border-white/10 dark:border-t-[#34d399]" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#34d399]/10 to-[#22c55e]/10">
              <ShoppingBag className="h-7 w-7 text-[#22c55e] dark:text-[#34d399]" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Your bag is empty
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Looks like you haven't added anything yet.
              </p>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/40 hover:brightness-110"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group flex gap-3 rounded-2xl border border-gray-100 p-3 transition-all duration-300 hover:border-gray-200 hover:shadow-md dark:border-white/5 dark:hover:border-white/10"
                >
                  {/* Placeholder image with initial */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#34d399]/15 to-[#22c55e]/15 text-2xl font-bold text-[#22c55e] dark:text-[#34d399]">
                    {item.productName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {item.productName}
                        </h4>
                        <p className="mt-0.5 text-sm font-semibold text-[#22c55e] dark:text-[#34d399]">
                          {formatPrice(item.productPrice)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        aria-label={`Remove ${item.productName} from bag`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-gray-200 dark:border-white/10">
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, item.quantity, -1)}
                          aria-label={`Decrease quantity of ${item.productName}`}
                          className="flex h-8 w-8 items-center justify-center rounded-l-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#22c55e] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-[#34d399]"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQty(item.id, item.quantity, 1)}
                          aria-label={`Increase quantity of ${item.productName}`}
                          className="flex h-8 w-8 items-center justify-center rounded-r-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#22c55e] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-[#34d399]"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-4 dark:border-white/5">
              <div className="mb-1 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-base font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoCheckout}
                  className="w-full rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] py-3 text-sm font-semibold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/40 hover:brightness-110 active:scale-[0.98]"
                >
                  Checkout
                </button>
                <button
                  type="button"
                  onClick={handleViewBag}
                  className="w-full rounded-full border border-gray-200 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  View Bag
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
