import ProductCard from "./ProductCard";
import Loader from "../common/Loader";

export default function ProductGrid({ products, loading, emptyMessage }) {
  if (loading) {
    return <Loader />;
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        {emptyMessage || "No products found"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
