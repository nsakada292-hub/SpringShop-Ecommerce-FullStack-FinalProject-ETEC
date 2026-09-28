import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { productApi } from '../../api/productApi';
import { ProductGrid } from './ProductGrid';

interface RelatedProductsProps {
  currentProductId: number;
  categoryId: number;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ currentProductId, categoryId }) => {
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const allInCat = await productApi.getByCategory(categoryId);
        const filtered = allInCat.filter(p => p.id !== currentProductId).slice(0, 4);
        if (filtered.length === 0) {
          // Fallback to general products
          const all = await productApi.getAll({ limit: 5 });
          setRelated(all.filter(p => p.id !== currentProductId).slice(0, 4));
        } else {
          setRelated(filtered);
        }
      } catch (err) {
        console.error('Failed to load related products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRelated();
  }, [currentProductId, categoryId]);

  if (!loading && related.length === 0) return null;

  return (
    <section className="mt-20 pt-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            You Might Also Love
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Carefully matched pieces from the same collection.
          </p>
        </div>
      </div>
      <ProductGrid products={related} loading={loading} />
    </section>
  );
};
