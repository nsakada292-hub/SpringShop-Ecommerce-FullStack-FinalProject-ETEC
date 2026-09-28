import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { Spinner } from '../common/Spinner';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  emptyMessage = 'No products found matching your criteria.',
}) => {
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-400">Loading catalog items...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-16 px-4 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{emptyMessage}</p>
        <p className="text-xs text-zinc-400 mt-1">Try clearing some filters or searching for another keyword.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
