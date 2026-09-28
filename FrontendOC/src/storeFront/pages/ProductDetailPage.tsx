import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Heart,
  ShoppingBag,
  ChevronDown,
  Share2,
  Send,
  MessageCircle,
  Link2,
  Check,
  Minus,
  Plus,
  Layers,
  Package,
  Ruler,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ImageOff,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/shared/types'
import { productsApi } from '@/shared/api/products.api'
import { useCart } from '@/shared/contexts/CartContext'
import { useWishlist } from '@/shared/contexts/WishlistContext'
import { useDrawer } from '@/shared/contexts/DrawerContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import { ProductGrid } from '@/storeFront/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/shared/components/ui/Skeleton'
import { formatPrice, formatDate } from '@/shared/utils/cn'

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

const isValidColor = (color: string) =>
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ||
  /^(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white|gray|grey|brown|beige|navy|maroon|olive|aqua|gold|silver)$/i.test(
    color
  )

function Accordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 dark:text-white dark:hover:bg-white/5"
        aria-expanded={open}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600 dark:border-white/5 dark:text-gray-400">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { addItem } = useCart()
  const { openCart } = useDrawer()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { isAuthenticated } = useAuth()

  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!id) {
      setError(true)
      setIsLoading(false)
      return
    }
    setProduct(null)
    setError(false)
    setIsLoading(true)
    setActiveImage(0)
    setSelectedSize(null)
    setSelectedColor(null)
    setQuantity(1)

    productsApi
      .getById(Number(id))
      .then(({ data }) => setProduct(data))
      .catch(() => setError(true))
      .finally(() => setIsLoading(false))
  }, [id])

  const sizes = useMemo(() => (product ? splitList(product.size) : []), [product])
  const colors = useMemo(() => (product ? splitList(product.color) : []), [product])

  const images = useMemo(() => {
    if (!product) return []
    if (product.image) return [product.image]
    return []
  }, [product])

  const outOfStock = product ? product.stockQuantity <= 0 : false
  const hasDiscount = product ? product.discountPercentage > 0 : false
  const salePrice = product ? (product.salePrice ?? product.price) : 0
  const isNew = useMemo(
    () => (product ? Date.now() - new Date(product.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000 : false),
    [product]
  )

  const wishlisted = product ? isInWishlist(product.id) : false

  const handleAddToBag = async () => {
    if (!product || outOfStock) return
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to your bag')
      return
    }
    setAdding(true)
    try {
      await addItem(product.id, quantity)
      toast.success(`${product.productName} added to bag`)
      openCart()
    } catch {
      toast.error('Failed to add to bag')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleWishlist = async () => {
    if (!product) return
    try {
      await toggleWishlist(product)
      if (!wishlisted) toast.success('Added to wishlist')
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy link')
    }
  }

  const handleShare = (platform: 'facebook' | 'twitter') => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(product?.productName ?? '')
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer')
    } else {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer')
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-3xl bg-surface-200 dark:bg-surface-800" />
          <div className="space-y-5 py-4">
            <div className="h-4 w-1/3 animate-pulse rounded bg-surface-200 dark:bg-surface-800" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-surface-200 dark:bg-surface-800" />
            <div className="h-8 w-1/2 animate-pulse rounded bg-surface-200 dark:bg-surface-800" />
            <div className="h-24 w-full animate-pulse rounded bg-surface-200 dark:bg-surface-800" />
            <div className="h-12 w-full animate-pulse rounded bg-surface-200 dark:bg-surface-800" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 pt-24 text-center">
        <ImageOff className="mb-4 h-14 w-14 text-gray-300 dark:text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product not found</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/category"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all hover:brightness-110 active:scale-95"
        >
          Continue shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-[#22c55e] dark:hover:text-[#34d399]">
          Home
        </Link>
        <span>/</span>
        <Link to="/category" className="transition-colors hover:text-[#22c55e] dark:hover:text-[#34d399]">
          {product.category?.categoryName ?? 'Category'}
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900 dark:text-white">{product.productName}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[55%_45%]">
        {/* Left: gallery */}
        <div>
          <div className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-3xl bg-white ring-1 ring-gray-100 dark:bg-white/5 dark:ring-white/5">
            {images.length > 0 ? (
              <img
                src={images[activeImage]}
                alt={product.productName}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#34d399]/5 to-[#22c55e]/5">
                <ImageOff className="h-14 w-14 text-gray-300 dark:text-gray-600" />
                <span className="text-sm text-gray-400">No image available</span>
              </div>
            )}

            <span className="absolute left-4 top-4 rounded-full bg-black/55 px-3.5 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              {product.category?.categoryName ?? 'Category'}
            </span>
            {isNew && (
              <span className="absolute left-4 top-14 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-[#22c55e]/30">
                New
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`h-24 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition-all duration-200 ${
                    activeImage === i
                      ? 'ring-[#22c55e] dark:ring-[#34d399]'
                      : 'ring-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.productName} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#22c55e] dark:text-[#34d399]">
            {product.category?.categoryName ?? 'Category'}
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {product.productName}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              {hasDiscount && (
                <span className="text-xl font-semibold text-gray-400 line-through dark:text-gray-500">
                  {formatPrice(product.price)}
                </span>
              )}
              <span
                className={`bg-gradient-to-r from-[#34d399] to-[#22c55e] bg-clip-text text-3xl font-bold text-transparent ${
                  hasDiscount ? 'from-red-500 to-fuchsia-500' : ''
                }`}
              >
                {formatPrice(salePrice)}
              </span>
              {hasDiscount && (
                <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500">
                  -{product.discountPercentage}% off
                </span>
              )}
            </div>
            {outOfStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                Out of stock
              </span>
            ) : product.stockQuantity <= 10 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                Low stock — only {product.stockQuantity} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                In stock
              </span>
            )}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {product.description || 'No description available for this product.'}
          </p>

          {/* Size selector */}
          {sizes.length > 0 && (
            <div className="mt-7">
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white">
                  <Ruler className="h-4 w-4 text-[#22c55e] dark:text-[#34d399]" /> Select Size
                </h3>
                {selectedSize && (
                  <span className="text-xs font-medium text-[#22c55e] dark:text-[#34d399]">{selectedSize}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    disabled={outOfStock}
                    className={`min-w-12 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      selectedSize === size
                        ? 'border-[#22c55e] bg-[#22c55e] text-white shadow-lg shadow-[#22c55e]/30 dark:border-[#34d399] dark:bg-[#34d399]'
                        : 'border-gray-300 text-gray-700 hover:border-[#22c55e] hover:text-[#22c55e] dark:border-white/15 dark:text-gray-200 dark:hover:border-[#34d399] dark:hover:text-[#34d399]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color selector */}
          {colors.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2.5 text-sm font-bold text-gray-900 dark:text-white">Color</h3>
              <div className="flex flex-wrap gap-3">
                {colors.map((color) => {
                  const active = selectedColor === color
                  const swatch = isValidColor(color) ? color : undefined
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      disabled={outOfStock}
                      title={color}
                      className={`flex h-11 items-center gap-2 rounded-full border px-3 transition-all duration-200 ${
                        active
                          ? 'border-[#22c55e] ring-2 ring-[#22c55e]/30 dark:border-[#34d399] dark:ring-[#34d399]/30'
                          : 'border-gray-200 hover:border-gray-400 dark:border-white/10'
                      }`}
                    >
                      {swatch ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-black/10" style={{ backgroundColor: swatch }}>
                          {active && <Check className="h-4 w-4 text-white mix-blend-difference" />}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">{color}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Material */}
          {product.material && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
              <Layers className="h-4 w-4 shrink-0 text-[#22c55e] dark:text-[#34d399]" />
              <span className="text-gray-500 dark:text-gray-400">Material:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{product.material}</span>
            </div>
          )}

          {/* Quantity + add */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-gray-300 dark:border-white/15">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={outOfStock || quantity <= 1}
                aria-label="Decrease quantity"
                className="flex h-12 w-12 items-center justify-center rounded-l-full text-gray-500 transition-colors hover:text-[#22c55e] disabled:opacity-40 dark:text-gray-300 dark:hover:text-[#34d399]"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm font-bold text-gray-900 dark:text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                disabled={outOfStock || quantity >= product.stockQuantity}
                aria-label="Increase quantity"
                className="flex h-12 w-12 items-center justify-center rounded-r-full text-gray-500 transition-colors hover:text-[#22c55e] disabled:opacity-40 dark:text-gray-300 dark:hover:text-[#34d399]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToBag}
              disabled={outOfStock || adding}
              className="group inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-6 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#22c55e]/50 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {adding ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShoppingBag className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-6" />
              )}
              {outOfStock ? 'Out of Stock' : `Add to Bag — ${formatPrice(salePrice * quantity)}`}
            </button>

            <button
              type="button"
              onClick={handleToggleWishlist}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-300 active:scale-90 ${
                wishlisted
                  ? 'border-pink-500 bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                  : 'border-gray-300 text-gray-500 hover:border-pink-400 hover:text-pink-500 dark:border-white/15 dark:text-gray-300 dark:hover:border-pink-400 dark:hover:text-pink-400'
              }`}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Accordions */}
          <div className="mt-8 space-y-3">
            <Accordion title="Description">
              {product.description || 'No description available.'}
            </Accordion>
            <Accordion title="Shipping & Returns">
              <p className="mb-3">
                Free standard shipping on all orders over $75. Delivery typically takes
                3-5 business days.
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Free standard shipping over $75</li>
                <li>Express shipping available at checkout</li>
                <li>30-day easy returns on all unused items</li>
                <li>Free return shipping on exchanges</li>
              </ul>
            </Accordion>
            <Accordion title="Care Instructions">
              <ul className="list-disc space-y-1 pl-5">
                <li>Machine wash cold with like colors</li>
                <li>Do not bleach or tumble dry</li>
                <li>Iron on low heat if needed</li>
                <li>Dry clean recommended for delicate fabrics</li>
              </ul>
            </Accordion>
          </div>

          {/* Share */}
          <div className="mt-8 border-t border-gray-100 pt-6 dark:border-white/5">
            <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
              <Share2 className="h-4 w-4 text-[#22c55e] dark:text-[#34d399]" /> Share this product
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleShare('facebook')}
                aria-label="Share on Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1877F2] text-white transition-all duration-300 hover:scale-110 active:scale-90"
              >
                <Send className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => handleShare('twitter')}
                aria-label="Share on Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-all duration-300 hover:scale-110 active:scale-90 dark:bg-white dark:text-black"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-10 items-center gap-2 rounded-full border border-gray-300 px-4 text-sm font-semibold text-gray-600 transition-all duration-300 hover:border-[#34d399] hover:text-[#22c55e] active:scale-95 dark:border-white/15 dark:text-gray-300 dark:hover:border-[#34d399] dark:hover:text-[#34d399]"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Link2 className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          </div>

          <p className="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <Package className="h-3.5 w-3.5" />
            Added on {formatDate(product.createdAt)}
          </p>
        </div>
      </div>

      {/* Related products */}
      <RelatedProducts current={product} />
    </div>
  )
}

function RelatedProducts({ current }: { current: Product }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    productsApi
      .getAll()
      .then(({ data }) => {
        if (!active) return
        let related = data.filter((p) => p.category?.id === current.category?.id && p.id !== current.id)
        if (related.length === 0) {
          related = data.filter((p) => p.id !== current.id)
        }
        setProducts(related.slice(0, 4))
      })
      .catch(() => {
        if (active) setProducts([])
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [current])

  return (
    <section className="mt-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#22c55e] dark:text-[#34d399]">
            <span className="h-px w-6 bg-[#34d399]" />
            Complete the look
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            You may also like
          </h2>
        </div>
      </div>

      {isLoading ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <ProductGrid products={products} emptyMessage="No related products found" />
      )}
    </section>
  )
}
