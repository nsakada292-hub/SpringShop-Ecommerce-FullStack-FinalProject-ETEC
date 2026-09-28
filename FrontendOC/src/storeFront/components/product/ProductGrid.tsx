import type { Product } from '@/shared/types'
import { ProductGridSkeleton } from '@/shared/components/ui/Skeleton'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  emptyMessage?: string
}

export function ProductGrid({ products, isLoading, emptyMessage = 'No products found' }: ProductGridProps) {
  if (isLoading) return <ProductGridSkeleton />

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-surface-400 dark:text-surface-500 text-lg">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
