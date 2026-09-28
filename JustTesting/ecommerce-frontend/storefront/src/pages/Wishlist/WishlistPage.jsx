import { useWishlist } from "../../hooks/useWishlist";
import ProductGrid from "../../components/product/ProductGrid";
import EmptyState from "../../components/common/EmptyState";
import { Link } from "react-router-dom";

export default function WishlistPage() {
  const { products, loading } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8">
        Your Love List
      </h1>

      {!loading && products.length === 0 ? (
        <EmptyState
          title="No saved items yet"
          description="Browse our collection and save items you love"
        >
          <Link
            to="/category/women"
            className="inline-block px-6 py-3 text-sm font-medium text-white bg-lagoon-gradient rounded-lg hover:opacity-90"
          >
            Browse Products
          </Link>
        </EmptyState>
      ) : (
        <ProductGrid products={products} loading={loading} />
      )}
    </div>
  );
}
