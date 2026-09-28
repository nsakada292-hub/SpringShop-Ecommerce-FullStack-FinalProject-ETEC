import { useState, useEffect, useMemo } from 'react'
import { Star, Search, Info } from 'lucide-react'
import { formatDate } from '@/shared/utils/cn'
import { productsApi } from '@/shared/api/products.api'
import { reviewsApi } from '@/shared/api/reviews.api'
import type { Product, Review } from '@/shared/types'
import { Skeleton } from '@/shared/components/ui/Skeleton'

interface ReviewRow extends Review {
  product: Product | undefined
}

const sampleReviews: ReviewRow[] = [
  {
    id: 1,
    userId: 101,
    userName: 'John Doe',
    productId: 1,
    product: { id: 1, productName: 'Vintage Leather Bag', description: '', price: 189, stockQuantity: 5, category: { id: 1, categoryName: 'Bags' }, size: 'M', color: 'Brown', material: 'Leather', image: '', createdAt: '', updatedAt: '' } as Product,
    rating: 5,
    comment: 'Great quality and fast shipping!',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 2,
    userId: 102,
    userName: 'Sarah Kim',
    productId: 2,
    product: { id: 2, productName: 'Cotton T-Shirt', description: '', price: 25, stockQuantity: 50, category: { id: 2, categoryName: 'Apparel' }, size: 'L', color: 'White', material: 'Cotton', image: '', createdAt: '', updatedAt: '' } as Product,
    rating: 4,
    comment: 'Comfortable and fits well.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: 3,
    userId: 103,
    userName: 'Michael Lee',
    productId: 3,
    product: { id: 3, productName: 'Classic Sneakers', description: '', price: 95, stockQuantity: 3, category: { id: 3, categoryName: 'Footwear' }, size: '42', color: 'Black', material: 'Canvas', image: '', createdAt: '', updatedAt: '' } as Product,
    rating: 3,
    comment: 'Decent but runs a bit small.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-surface-300 dark:text-surface-600'}
        />
      ))}
      <span className="ml-1.5 text-xs text-surface-500 dark:text-surface-400 font-medium">{rating}/5</span>
    </div>
  )
}

const statusMessage = {
  loading: 'Loading review data...',
  error: 'Product review API requires per-product access and failed to load. Showing sample data below.',
  none: 'No reviews found for available products. Showing sample data below.',
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>(sampleReviews)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<'loaded' | 'error' | 'none'>('none')
  const [search, setSearch] = useState('')
  const [usingSample, setUsingSample] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        const { data } = await productsApi.getAll()
        if (cancelled) return

        const productIds = data.slice(0, 5).map((p) => p.id)
        const settled = await Promise.allSettled(
          productIds.map((id) => reviewsApi.getByProduct(id))
        )

        const found: ReviewRow[] = []
        settled.forEach((res) => {
          if (res.status === 'fulfilled' && Array.isArray(res.value?.data)) {
            res.value.data.forEach((r: Review) => {
              found.push({ ...r, product: data.find((p) => p.id === r.productId) })
            })
          }
        })

        if (cancelled) return
        if (found.length > 0) {
          setReviews(found)
          setUsingSample(false)
          setMode('loaded')
        } else {
          setReviews(sampleReviews)
          setUsingSample(true)
          setMode('none')
        }
      } catch {
        if (cancelled) return
        setReviews(sampleReviews)
        setUsingSample(true)
        setMode('error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return reviews
    return reviews.filter(
      (r) =>
        (r.userName ?? '').toLowerCase().includes(q) ||
        (r.product?.productName ?? '').toLowerCase().includes(q)
    )
  }, [reviews, search])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Reviews</h1>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">Customer reviews and ratings</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
        <input
          type="text"
          placeholder="Search by customer or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-aqua/30 focus:border-brand-aqua transition-all"
        />
      </div>

      {usingSample && !loading && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-brand-aqua/10 border border-brand-aqua/25 text-brand-aqua">
          <Info size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">
            {mode === 'error' ? statusMessage.error : statusMessage.none} Reviews require per-product API access.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-200 dark:border-surface-800">
                  <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Customer</th>
                  <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Product</th>
                  <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Rating</th>
                  <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Comment</th>
                  <th className="text-left text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-surface-200 dark:border-surface-800/50 last:border-0 hover:bg-surface-100 dark:hover:bg-surface-800/30 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-surface-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-800 text-xs font-bold text-brand-aqua">
                          {(r.userName ?? 'R').charAt(0).toUpperCase()}
                        </div>
                        {r.userName ?? `User #${r.userId}`}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-surface-600 dark:text-surface-300">{r.product?.productName ?? `Product #${r.productId}`}</td>
                    <td className="py-4 px-4"><StarRating rating={r.rating} /></td>
                    <td className="py-4 px-4 text-sm text-surface-500 dark:text-surface-400 max-w-[300px]">{r.comment}</td>
                    <td className="py-4 px-4 text-sm text-surface-500 dark:text-surface-400">{r.createdAt ? formatDate(r.createdAt) : '-'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-surface-500 dark:text-surface-400 text-sm">
                      No reviews found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
