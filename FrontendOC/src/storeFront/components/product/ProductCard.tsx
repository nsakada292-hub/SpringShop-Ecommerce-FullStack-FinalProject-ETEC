import type { MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/shared/types'
import { formatPrice } from '@/shared/utils/cn'
import { useWishlist } from '@/shared/contexts/WishlistContext'
import { useCart } from '@/shared/contexts/CartContext'
import { useAuth } from '@/shared/contexts/AuthContext'

interface ProductCardProps {
  product: Product
}

function getStockStatus(stock: number): { label: string; className: string } {
  if (stock <= 0) return { label: 'Out of stock', className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400' }
  if (stock <= 10) return { label: 'Low stock', className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' }
  return { label: 'In stock', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const wishlisted = isInWishlist(product.id)
  const stock = getStockStatus(product.stockQuantity)
  const outOfStock = product.stockQuantity <= 0
  const hasDiscount = product.discountPercentage > 0
  const salePrice = product.salePrice ?? product.price

  const handleAddToCart = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      navigate('/sign-in')
      return
    }

    if (outOfStock) {
      toast.error('This product is currently out of stock')
      return
    }

    try {
      await addItem(product.id, 1)
      toast.success('Added to cart')
    } catch {
      toast.error('Failed to add to cart')
    }
  }

  const handleToggleWishlist = async (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await toggleWishlist(product)
      if (!wishlisted) {
        toast.success('Added to wishlist')
      }
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-white/5 shadow-sm ring-1 ring-gray-100 dark:ring-white/5 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/40 hover:-translate-y-0.5"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-white/5">
        {product.image ? (
          <img
            src={product.image}
            alt={product.productName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-gray-400">No image</span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-110 active:scale-95 ${
            wishlisted
              ? 'bg-gradient-to-br from-pink-500 to-red-500 text-white'
              : 'bg-white/90 dark:bg-black/50 text-gray-600 dark:text-gray-300 backdrop-blur-sm hover:bg-white dark:hover:bg-black/70'
          }`}
        >
          <Heart className={`h-4.5 w-4.5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Discount badge */}
        {hasDiscount && (
          <span className="absolute top-2.5 left-2.5 rounded-full bg-gradient-to-r from-red-500 to-fuchsia-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
            -{product.discountPercentage}%
          </span>
        )}

        {/* Stock badge */}
        <span
          className={`absolute bottom-2.5 left-2.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${stock.className}`}
        >
          {stock.label}
        </span>

        {/* Add to cart overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-300 group-hover:translate-y-0 ${
            outOfStock ? 'pointer-events-none opacity-0' : ''
          }`}
        >
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex w-full items-center justify-center gap-2 bg-black/85 dark:bg-white/95 py-3 text-sm font-medium text-white dark:text-black backdrop-blur-sm transition-colors hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 dark:hover:from-pink-500 dark:hover:to-purple-500 dark:hover:text-white"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
          {product.category?.categoryName ?? 'Category'}
        </p>
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-white transition-colors group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400">
          {product.productName}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[11px] font-medium text-gray-400 line-through dark:text-gray-500">
                {formatPrice(product.price)}
              </span>
            )}
            <span className={`text-base font-bold ${hasDiscount ? 'text-fuchsia-600 dark:text-fuchsia-400' : 'text-gray-900 dark:text-white'}`}>
              {formatPrice(salePrice)}
            </span>
          </div>
          {product.size && (
            <span className="text-xs text-gray-400 dark:text-gray-500">{product.size}</span>
          )}
        </div>
      </div>
    </Link>
  )
}
