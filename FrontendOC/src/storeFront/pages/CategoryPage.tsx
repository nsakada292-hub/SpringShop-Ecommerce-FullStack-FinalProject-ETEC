import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  Search,
  CheckCircle2,
} from 'lucide-react'
import type { Category, Product } from '@/shared/types'
import { categoriesApi } from '@/shared/api/categories.api'
import { productsApi } from '@/shared/api/products.api'
import { ProductGrid } from '@/storeFront/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/shared/components/ui/Skeleton'

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'name-asc'

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name A-Z' },
]

const isValidColor = (color: string) =>
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color) ||
  /^(red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white|gray|grey|brown|beige|navy|maroon|olive|aqua|gold|silver)$/i.test(
    color
  )

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export default function CategoryPage() {
  const { categoryId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoadingCategory, setIsLoadingCategory] = useState(true)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeSubs, setActiveSubs] = useState<number[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [activeSizes, setActiveSizes] = useState<string[]>([])
  const [activeColors, setActiveColors] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('featured')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const subParam = searchParams.get('sub')
    if (subParam) {
      setActiveSubs([Number(subParam)])
    }
  }, [searchParams])

  useEffect(() => {
    if (!categoryId) return
    setActiveSubs([])
    setMinPrice('')
    setMaxPrice('')
    setActiveSizes([])
    setActiveColors([])
    setSort('featured')

    setIsLoadingCategory(true)
    setIsLoadingProducts(true)
    setError(null)
    setCategory(null)
    setSubcategories([])
    setProducts([])

    const id = Number(categoryId)
    if (!Number.isFinite(id)) {
      setError('Category not found')
      setIsLoadingCategory(false)
      setIsLoadingProducts(false)
      return
    }

    categoriesApi
      .getById(id)
      .then(({ data }) => setCategory(data))
      .catch(() => setError('Failed to load category'))
      .finally(() => setIsLoadingCategory(false))

    categoriesApi
      .getSubcategories(id)
      .then(({ data }) => setSubcategories(data))
      .catch(() => setSubcategories([]))

    productsApi
      .getByCategory(id)
      .then(({ data }) => setProducts(data))
      .catch(() => setError((prev) => prev ?? 'Failed to load products'))
      .finally(() => setIsLoadingProducts(false))
  }, [categoryId])

  const allSizes = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => parseList(p.size).forEach((s) => set.add(s)))
    return Array.from(set)
  }, [products])

  const allColors = useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => parseList(p.color).forEach((c) => set.add(c)))
    return Array.from(set)
  }, [products])

  const filtered = useMemo(() => {
    let result = products

    if (activeSubs.length > 0) {
      result = result.filter((p) => activeSubs.includes(p.category.id))
    }

    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)
    if (min !== null || max !== null) {
      result = result.filter((p) => {
        const price = p.salePrice ?? p.price
        if (min !== null && price < min) return false
        if (max !== null && price > max) return false
        return true
      })
    }

    if (activeSizes.length > 0) {
      result = result.filter((p) => {
        const sizes = parseList(p.size)
        return activeSizes.some((s) => sizes.includes(s))
      })
    }

    if (activeColors.length > 0) {
      result = result.filter((p) => {
        const colors = parseList(p.color)
        return activeColors.some((c) => colors.includes(c))
      })
    }

    switch (sort) {
      case 'price-asc':
        result = [...result].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price))
        break
      case 'price-desc':
        result = [...result].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price))
        break
      case 'name-asc':
        result = [...result].sort((a, b) => a.productName.localeCompare(b.productName))
        break
      default:
        break
    }

    return result
  }, [products, activeSubs, minPrice, maxPrice, activeSizes, activeColors, sort])

  const hasFilters =
    activeSubs.length > 0 || minPrice !== '' || maxPrice !== '' || activeSizes.length > 0 || activeColors.length > 0

  const clearAll = () => {
    setActiveSubs([])
    setMinPrice('')
    setMaxPrice('')
    setActiveSizes([])
    setActiveColors([])
    if (searchParams.get('sub')) {
      setSearchParams({}, { replace: true })
    }
  }

  const toggleSub = (id: number) =>
    setActiveSubs((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))

  const toggleSize = (size: string) =>
    setActiveSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]))

  const toggleColor = (color: string) =>
    setActiveColors((prev) => (prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]))

  const handlePriceSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  const loading = isLoadingCategory || isLoadingProducts

  const FilterPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">
          Filters
        </h3>
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs font-medium text-red-500 transition-colors hover:text-red-600"
          >
            <X className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {subcategories.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Category
          </h4>
          <div className="space-y-2">
            {subcategories.map((sub) => {
              const checked = activeSubs.includes(sub.id)
              return (
                <label
                  key={sub.id}
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700 transition-colors hover:text-[#22c55e] dark:text-gray-300 dark:hover:text-[#34d399]"
                >
                  <span
                    className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked
                        ? 'border-[#22c55e] bg-[#22c55e] text-white dark:border-[#34d399] dark:bg-[#34d399]'
                        : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-white/5'
                    }`}
                  >
                    {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </span>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSub(sub.id)}
                    className="sr-only"
                  />
                  {sub.categoryName}
                </label>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Price Range
        </h4>
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray-500"
          />
        </form>
      </div>

      {allSizes.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Size
          </h4>
          <div className="flex flex-wrap gap-2">
            {allSizes.map((size) => {
              const active = activeSizes.includes(size)
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`min-w-10 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                    active
                      ? 'border-[#22c55e] bg-[#22c55e] text-white dark:border-[#34d399] dark:bg-[#34d399]'
                      : 'border-gray-300 text-gray-600 hover:border-[#22c55e] hover:text-[#22c55e] dark:border-gray-600 dark:text-gray-300 dark:hover:border-[#34d399] dark:hover:text-[#34d399]'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {allColors.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Color
          </h4>
          <div className="flex flex-wrap gap-2">
            {allColors.map((color) => {
              const active = activeColors.includes(color)
              const swatch = isValidColor(color) ? color : undefined
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => toggleColor(color)}
                  title={color}
                  className={`flex h-9 items-center gap-2 rounded-full border px-2.5 transition-all duration-200 ${
                    active
                      ? 'border-[#22c55e] ring-2 ring-[#22c55e]/30 dark:border-[#34d399] dark:ring-[#34d399]/30'
                      : 'border-gray-200 dark:border-white/10'
                  }`}
                >
                  {swatch ? (
                    <span
                      className={`h-6 w-6 rounded-full border border-black/10 ${active ? '' : 'opacity-80'}`}
                      style={{ backgroundColor: swatch }}
                    />
                  ) : (
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        active
                          ? 'bg-[#22c55e] text-white dark:bg-[#34d399]'
                          : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                      }`}
                    >
                      {color}
                    </span>
                  )}
                  {active && <CheckCircle2 className="h-3.5 w-3.5 text-[#22c55e] dark:text-[#34d399]" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  if (error && !category) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 text-center pt-16">
        <Search className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Category not found</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">{error}</p>
        <Link
          to="/category"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all hover:brightness-110 active:scale-95"
        >
          Browse all categories
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
        <Link to="/" className="transition-colors hover:text-[#22c55e] dark:hover:text-[#34d399]">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {isLoadingCategory ? '...' : category?.categoryName ?? 'Category'}
        </span>
      </nav>

      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {isLoadingCategory ? 'Loading...' : category?.categoryName ?? 'Category'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {isLoadingProducts ? 'Loading...' : `${filtered.length} product${filtered.length === 1 ? '' : 's'}`}
          </p>
        </div>

        {/* Mobile filter button */}
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-[#34d399] hover:text-[#22c55e] dark:border-white/15 dark:text-gray-200 dark:hover:border-[#34d399] dark:hover:text-[#34d399] lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22c55e] text-[10px] font-bold text-white dark:bg-[#34d399]">
              {activeSubs.length + activeSizes.length + activeColors.length + (minPrice !== '' ? 1 : 0) + (maxPrice !== '' ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-[260px] shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 dark:border-white/5 dark:bg-white/[0.02]">
            {FilterPanel}
          </div>
        </aside>

        {/* Mobile sidebar panel */}
        <div
          className={`fixed inset-0 z-50 lg:hidden ${
            sidebarOpen ? 'visible' : 'invisible'
          }`}
        >
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-2xl transition-transform duration-300 dark:bg-[#111114] ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filter Products</h3>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {FilterPanel}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="mt-8 w-full rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] py-3 text-sm font-bold text-white shadow-lg shadow-[#22c55e]/30 transition-all hover:brightness-110 active:scale-95"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>

        {/* Right content */}
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort products"
                className="appearance-none rounded-full border border-gray-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-gray-900 transition-colors focus:border-[#34d399] focus:outline-none focus:ring-2 focus:ring-[#34d399]/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Search className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">No products found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your filters or search criteria.
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-[#34d399] hover:text-[#22c55e] dark:border-white/15 dark:text-gray-200 dark:hover:border-[#34d399] dark:hover:text-[#34d399]"
                >
                  <X className="h-4 w-4" />
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <ProductGrid products={filtered} />
          )}
        </div>
      </div>
    </div>
  )
}
