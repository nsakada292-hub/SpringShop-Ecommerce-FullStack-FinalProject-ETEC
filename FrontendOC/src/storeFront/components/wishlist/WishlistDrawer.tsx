import { useEffect, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDrawer } from '@/shared/contexts/DrawerContext'
import { useWishlist } from '@/shared/contexts/WishlistContext'
import { useCart } from '@/shared/contexts/CartContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import { formatPrice } from '@/shared/utils/cn'

export default function WishlistDrawer() {
  const { isWishlistOpen, closeWishlist } = useDrawer()
  const { items, removeItem } = useWishlist()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') closeWishlist()
    }
    if (isWishlistOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isWishlistOpen, closeWishlist])

  const handleAddToBag = async (productId: number, productName: string) => {
    if (!isAuthenticated) {
      closeWishlist()
      toast.error('Please sign in to add items to your bag')
      navigate('/sign-in')
      return
    }
    try {
      await addItem(productId, 1)
      toast.success(`${productName} added to bag`)
    } catch {
      toast.error('Failed to add to bag')
    }
  }

  const handleRemove = async (productId: number) => {
    try {
      await removeItem(productId)
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Failed to remove from wishlist')
    }
  }

  const keyHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeWishlist()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isWishlistOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeWishlist}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Wishlist"
        onKeyDown={keyHandler}
        className={`fixed inset-y-0 left-0 z-40 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#111114] ${
          isWishlistOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Wishlist
              {items.length > 0 && (
                <span className="ml-2 text-sm font-medium text-gray-400 dark:text-gray-500">
                  ({items.length} {items.length === 1 ? 'item' : 'items'})
                </span>
              )}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeWishlist}
            aria-label="Close wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/10 to-rose-500/10">
              <Heart className="h-7 w-7 text-pink-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                No loved items yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tap the heart on any product to save it here for later.
              </p>
            </div>
            <button
              type="button"
              onClick={closeWishlist}
              className="rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-pink-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/40 hover:brightness-110"
            >
              Explore products
            </button>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.map(({ product }) => (
                <div
                  key={product.id}
                  className="flex gap-3 rounded-2xl border border-gray-100 p-3 transition-all duration-300 hover:border-gray-200 hover:shadow-md dark:border-white/5 dark:hover:border-white/10"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-white/5">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.productName}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-gray-400 dark:text-gray-500">
                        {product.productName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {product.productName}
                        </h4>
                        {product.discountPercentage > 0 ? (
                          <p className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-pink-500 dark:text-pink-400">
                            <span className="text-xs font-medium text-gray-400 line-through dark:text-gray-500">
                              {formatPrice(product.price)}
                            </span>
                            {formatPrice(product.salePrice ?? product.price)}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-sm font-semibold text-pink-500 dark:text-pink-400">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(product.id)}
                        aria-label={`Remove ${product.productName} from wishlist`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-pink-50 hover:text-pink-500 dark:hover:bg-pink-500/10 dark:hover:text-pink-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToBag(product.id, product.productName)}
                      className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-pink-500/20 transition-all duration-300 hover:shadow-md hover:shadow-pink-500/30 hover:brightness-110 active:scale-[0.97]"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      Add to bag
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-5 py-4 dark:border-white/5">
              <Link
                to="/wishlist"
                onClick={closeWishlist}
                className="block w-full rounded-full bg-gradient-to-r from-pink-500 to-rose-500 py-3 text-center text-sm font-semibold text-white shadow-md shadow-pink-500/25 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/40 hover:brightness-110 active:scale-[0.98]"
              >
                View All
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
