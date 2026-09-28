import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import type { MouseEvent } from 'react'
import type { WishlistItem } from '@/shared/types'
import { useWishlist } from '@/shared/contexts/WishlistContext'
import { useCart } from '@/shared/contexts/CartContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import { formatPrice } from '@/shared/utils/cn'

export default function WishlistPage() {
  const { items, removeItem } = useWishlist()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [addingId, setAddingId] = useState<number | null>(null)

  const handleAddToCart = async (item: WishlistItem, e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      navigate('/sign-in')
      return
    }
    if (item.product.stockQuantity <= 0) {
      toast.error('This product is out of stock')
      return
    }
    setAddingId(item.product.id)
    try {
      await addItem(item.product.id, 1)
      toast.success('Added to cart')
      await removeItem(item.product.id)
    } catch {
      toast.error('Failed to add to cart')
    } finally {
      setAddingId(null)
    }
  }

  const handleRemove = async (item: WishlistItem, e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await removeItem(item.product.id)
      toast.success('Removed from wishlist')
    } catch {
      toast.error('Failed to remove from wishlist')
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 pt-24 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/15 to-rose-500/15 text-pink-500">
          <Heart className="h-11 w-11" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Your wishlist is empty
        </h1>
        <p className="mt-2 max-w-md text-gray-500 dark:text-gray-400">
          Tap the heart on any product to save it for later. Your wishlist keeps all
          your favorites in one place.
        </p>
        <Link
          to="/category"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-95"
        >
          Browse Products
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          <Heart className="h-8 w-8 fill-current text-pink-500" />
          My Wishlist
          <span className="text-lg font-medium text-gray-400">({items.length})</span>
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.product.id}
            to={`/product/${item.product.id}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-0.5 dark:bg-white/5 dark:ring-white/5 dark:hover:shadow-black/40"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-white/5">
              {item.product.image ? (
                <img
                  src={item.product.image}
                  alt={item.product.productName}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                </div>
              )}

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => handleRemove(item, e)}
                aria-label={`Remove ${item.product.productName} from wishlist`}
                className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-md backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-red-500 hover:text-white active:scale-95 dark:bg-black/50 dark:text-gray-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              {item.product.stockQuantity <= 0 && (
                <span className="absolute bottom-2.5 left-2.5 rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-medium text-red-700 dark:bg-red-500/15 dark:text-red-400">
                  Out of stock
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5 p-4">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {item.product.category?.categoryName ?? 'Category'}
              </p>
              <h3 className="line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-fuchsia-600 dark:text-white dark:group-hover:text-fuchsia-400">
                {item.product.productName}
              </h3>
              <div className="mt-auto flex items-center justify-between">
                {item.product.discountPercentage > 0 && (
                  <span className="text-xs font-medium text-gray-400 line-through dark:text-gray-500">
                    {formatPrice(item.product.price)}
                  </span>
                )}
                <span className={`text-base font-bold text-gray-900 dark:text-white ${item.product.discountPercentage > 0 ? 'text-fuchsia-600 dark:text-fuchsia-400' : ''}`}>
                  {formatPrice(item.product.salePrice ?? item.product.price)}
                </span>
                {item.product.discountPercentage > 0 && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-500">
                    -{item.product.discountPercentage}%
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => handleAddToCart(item, e)}
                disabled={addingId === item.product.id || item.product.stockQuantity <= 0}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] py-2.5 text-sm font-bold text-white shadow-md shadow-[#22c55e]/20 transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/40 hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
                {addingId === item.product.id
                  ? 'Adding...'
                  : item.product.stockQuantity <= 0
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
