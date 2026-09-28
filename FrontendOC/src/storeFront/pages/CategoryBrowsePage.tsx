import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, ChevronRight, ArrowRight, PackageOpen } from 'lucide-react'
import type { Category, Product } from '@/shared/types'
import { productsApi } from '@/shared/api/products.api'
import { useCategories } from '@/shared/hooks/useCategories'
import { ProductGrid } from '@/storeFront/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/shared/components/ui/Skeleton'
import { getImageGradient } from '@/shared/utils/imageGradient'
import womenImg from '@/assets/women.jpg'
import menImg from '@/assets/men.jpg'
import kidImg from '@/assets/kid.jpg'
import beautyImg from '@/assets/beauty.jpg'

function CategoryCard({
  category,
  productCount,
  image,
}: {
  category: Category
  productCount: number
  image?: string
}) {
  const { getSubcategories } = useCategories()
  const subs = getSubcategories(category.id)

  return (
    <Link
      to={`/category/${category.id}`}
      className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br from-[#34d399] to-[#22c55e] bg-cover bg-center p-6 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#22c55e]/30 dark:ring-white/10"
      style={{ backgroundImage: image ? `url(${image})` : getImageGradient(category.id) }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
          {productCount} product{productCount === 1 ? '' : 's'}
        </p>
        <h3 className="mt-1 text-2xl font-bold text-white">{category.categoryName}</h3>

        {subs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {subs.slice(0, 3).map((sub) => (
              <span
                key={sub.id}
                className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm"
              >
                {sub.categoryName}
              </span>
            ))}
            {subs.length > 3 && (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                +{subs.length - 3} more
              </span>
            )}
          </div>
        )}

        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
          Shop now
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  )
}

export default function CategoryBrowsePage() {
  const { topLevel, getSubcategories, isLoading: categoriesLoading } = useCategories()
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''

  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    let active = true
    productsApi
      .getAll()
      .then(({ data }) => {
        if (active) setAllProducts(data)
      })
      .catch(() => {
        if (active) setAllProducts([])
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!q) {
      setSearchResults([])
      return
    }
    setSearchLoading(true)
    let active = true
    productsApi
      .search(q)
      .then(({ data }) => {
        if (active) setSearchResults(data)
      })
      .catch(() => {
        if (active) setSearchResults([])
      })
      .finally(() => {
        if (active) setSearchLoading(false)
      })
    return () => {
      active = false
    }
  }, [q])

  const productCounts = useMemo(() => {
    const direct = new Map<number, number>()
    allProducts.forEach((p) => {
      direct.set(p.category.id, (direct.get(p.category.id) ?? 0) + 1)
    })
    const map = new Map<number, number>()
    topLevel.forEach((cat) => {
      const ids = [cat.id, ...getSubcategories(cat.id).map((c) => c.id)]
      map.set(
        cat.id,
        ids.reduce((sum, id) => sum + (direct.get(id) ?? 0), 0)
      )
    })
    return map
  }, [allProducts, topLevel, getSubcategories])

  const categoryImages = useMemo(() => {
    const named: Record<string, string> = {
      women: womenImg,
      men: menImg,
      kid: kidImg,
      kids: kidImg,
      beauty: beautyImg,
    }
    const map = new Map<number, string>()
    topLevel.forEach((cat) => {
      const name = cat.categoryName.toLowerCase()
      const namedImage = named[name] ?? Object.entries(named).find(([key]) => name.includes(key))?.[1]
      if (namedImage) {
        map.set(cat.id, namedImage)
        return
      }
      const ids = new Set([cat.id, ...getSubcategories(cat.id).map((c) => c.id)])
      const first = allProducts.find((p) => ids.has(p.category.id) && Boolean(p.image))
      if (first?.image) map.set(cat.id, first.image)
    })
    return map
  }, [allProducts, topLevel, getSubcategories])

  if (q) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
          <Link to="/" className="transition-colors hover:text-[#22c55e] dark:hover:text-[#34d399]">
            Home
          </Link>
          <span>/</span>
          <Link to="/category" className="transition-colors hover:text-[#22c55e] dark:hover:text-[#34d399]">
            Categories
          </Link>
          <span>/</span>
          <span className="font-medium text-gray-900 dark:text-white">Search</span>
        </nav>

        <div className="mb-8">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            <Search className="h-8 w-8 text-[#22c55e] dark:text-[#34d399]" />
            Results for “{q}”
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {searchLoading
              ? 'Searching...'
              : `${searchResults.length} result${searchResults.length === 1 ? '' : 's'} found`}
          </p>
        </div>

        {searchLoading ? (
          <ProductGridSkeleton count={8} />
        ) : searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <PackageOpen className="mb-4 h-14 w-14 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No products found</h3>
            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              We couldn't find anything matching “{q}”. Try a different keyword or browse all categories.
            </p>
            <Link
              to="/category"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all hover:brightness-110 active:scale-95"
            >
              Browse all categories
            </Link>
          </div>
        ) : (
          <ProductGrid products={searchResults} />
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-[#22c55e] dark:hover:text-[#34d399]">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900 dark:text-white">Categories</span>
      </nav>

      <div className="mb-10">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#22c55e] dark:text-[#34d399]">
          <span className="h-px w-6 bg-[#34d399]" />
          Shop by department
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          Explore Categories
        </h1>
        <p className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400 sm:text-base">
          Discover curated collections across every department — find the perfect
          pieces for your style.
        </p>
      </div>

      {categoriesLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] animate-pulse rounded-3xl bg-surface-200 dark:bg-surface-800"
            />
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="mb-4 h-14 w-14 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No categories yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Check back soon for new categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {topLevel.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              productCount={productCounts.get(category.id) ?? 0}
              image={categoryImages.get(category.id)}
            />
          ))}
        </div>
      )}

      {/* Subcategories strip */}
      {!categoriesLoading && topLevel.length > 0 && (
        <section className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Popular Subcategories
            </h2>
            <Link
              to="/category"
              className="hidden items-center gap-1.5 text-sm font-semibold text-gray-600 transition-colors hover:text-[#22c55e] dark:text-gray-300 dark:hover:text-[#34d399] sm:inline-flex"
            >
              View all
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {topLevel.flatMap((cat) =>
              getSubcategories(cat.id).map((sub) => (
                <Link
                  key={sub.id}
                  to={`/category/${cat.id}?sub=${sub.id}`}
                  className="group flex shrink-0 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-all duration-300 hover:border-[#34d399] hover:bg-[#34d399]/5 hover:text-[#22c55e] dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:border-[#34d399] dark:hover:text-[#34d399]"
                >
                  {sub.categoryName}
                  <ChevronRight className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  )
}
