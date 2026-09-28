import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Product, Category } from '../../types';
import { productApi } from '../../api/productApi';
import { useCategories } from '../../hooks/useCategories';
import { CategoryFilterSidebar } from '../../components/category/CategoryFilterSidebar';
import { ProductGrid } from '../../components/product/ProductGrid';
import { ArrowUpDown } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const { categories, topLevelCategories, getSubcategories } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const typeParam = searchParams.get('type') || '';
  const selectedTypes = useMemo(() => (typeParam ? typeParam.split(',') : []), [typeParam]);
  const searchQuery = searchParams.get('search') || '';
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Match current category
  const isAll = !categorySlug || categorySlug === 'all';
  const currentCategory = useMemo(() => {
    if (isAll) return null;
    return categories.find(c => c.categoryName.toLowerCase() === categorySlug?.toLowerCase()) || null;
  }, [categorySlug, categories, isAll]);

  // Subcategories for current category
  const subcategories = useMemo(() => {
    if (isAll || !currentCategory) {
      return categories.filter(c => c.parentCategoryId !== null);
    }
    return getSubcategories(currentCategory.id);
  }, [isAll, currentCategory, categories, getSubcategories]);

  // Fetch products
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);
      try {
        let prods: Product[] = [];
        if (searchQuery) {
          prods = await productApi.search(searchQuery);
        } else if (currentCategory) {
          prods = await productApi.getByCategory(currentCategory.id);
        } else {
          prods = await productApi.getAll();
        }
        setProducts(prods);
      } catch (err) {
        console.error('Failed to load category products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [categorySlug, currentCategory, searchQuery]);

  // Reactive filtering and sorting
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Subtype/Subcategory filter
        if (selectedTypes.length > 0) {
          const matchSub = selectedTypes.some(t =>
            p.category.categoryName.toLowerCase().includes(t.toLowerCase()) ||
            p.productName.toLowerCase().includes(t.toLowerCase())
          );
          if (!matchSub) return false;
        }
        // Price filter
        if (p.price > maxPrice) return false;
        // In-stock filter
        if (inStockOnly && p.stockQuantity <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest') return b.id - a.id;
        return 0; // featured default
      });
  }, [products, selectedTypes, maxPrice, inStockOnly, sortBy]);

  const handleToggleType = (typeName: string) => {
    let next: string[];
    if (selectedTypes.includes(typeName)) {
      next = selectedTypes.filter(t => t !== typeName);
    } else {
      next = [...selectedTypes, typeName];
    }
    if (next.length > 0) {
      searchParams.set('type', next.join(','));
    } else {
      searchParams.delete('type');
    }
    setSearchParams(searchParams);
  };

  const handleResetFilters = () => {
    searchParams.delete('type');
    setSearchParams(searchParams);
    setMaxPrice(300);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const pageTitle = searchQuery
    ? `Search: "${searchQuery}"`
    : currentCategory
    ? currentCategory.categoryName
    : 'All Collections';

  const pageDesc = currentCategory?.description || 'Browse our complete catalog of curated essentials.';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Category Header Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-zinc-900 text-white border border-zinc-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-gradient opacity-10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative max-w-xl space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#00e1ff]">
            Catalog Archive
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {pageDesc}
          </p>
        </div>
      </div>

      {/* Main Layout: Sidebar Filters + Products Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filter Sidebar */}
        <CategoryFilterSidebar
          categoryName={currentCategory ? currentCategory.categoryName : 'Catalog'}
          subcategories={subcategories}
          selectedTypes={selectedTypes}
          onToggleType={handleToggleType}
          maxPrice={maxPrice}
          onPriceChange={setMaxPrice}
          inStockOnly={inStockOnly}
          onToggleInStock={() => setInStockOnly(!inStockOnly)}
          onReset={handleResetFilters}
        />

        {/* Content Area */}
        <div className="flex-1 w-full space-y-6">
          {/* Controls Bar: Results Count & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Showing <strong className="text-zinc-900 dark:text-zinc-100">{filteredProducts.length}</strong> products
            </span>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
              <label htmlFor="sortBy" className="text-xs text-zinc-500 font-medium">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 font-medium focus:outline-none focus:ring-2 focus:ring-[#009dff]"
              >
                <option value="featured">Featured Picks</option>
                <option value="newest">Newest Drops</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            emptyMessage="No products match your current filters. Try loosening your price or subtype selections."
          />
        </div>
      </div>
    </div>
  );
};
