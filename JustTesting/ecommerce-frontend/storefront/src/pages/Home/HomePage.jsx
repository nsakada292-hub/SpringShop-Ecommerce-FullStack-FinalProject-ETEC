import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getProducts } from "../../services/productService";
import { getReviewsForProduct } from "../../services/reviewService";
import ProductGrid from "../../components/product/ProductGrid";
import ReviewCard from "../../components/review/ReviewCard";
import SectionHeading from "../../components/common/SectionHeading";

// The backend has no "featured" flag, so the newest products act as
// the featured rails. Reviews are authenticated-only, so the testimonial
// rail renders only for signed-in visitors (and pulls from the first
// few products).
export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getProducts()
      .then((res) => {
        if (!active) return [];
        const products = res.data || [];
        const items = products.slice(0, 8);
        setFeatured(items);
        if (!isAuthenticated) return [];
        // Reviews are authenticated-only; pull from the first few rails.
        return Promise.all(
          items.slice(0, 3).map((p) => getReviewsForProduct(p.id).catch(() => ({ data: [] })))
        );
      })
      .then((perProduct) => {
        if (!active) return;
        setReviews(
          (perProduct || [])
            .flat()
            .flatMap((r) => r.data || [])
            .slice(0, 3)
        );
      })
      .catch(() => {
        if (active) setFeatured([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <div>
      <section className="bg-lagoon-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Fashion That Shines
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Discover the latest trends in women's, men's, kids' and beauty.
            Fresh drops every week.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/category/women"
              className="px-8 py-3 bg-white text-brand.blue rounded-lg font-semibold hover:opacity-90 transition shadow-lg"
            >
              Shop Women
            </Link>
            <Link
              to="/category/men"
              className="px-8 py-3 bg-white/20 text-white rounded-lg font-semibold hover:bg-white/30 transition border border-white/40"
            >
              Shop Men
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <SectionHeading>Featured Products</SectionHeading>
          <Link
            to="/category/women"
            className="text-sm font-medium text-brand.blue dark:text-brand.aqua hover:underline"
          >
            View all →
          </Link>
        </div>
        <ProductGrid products={featured} loading={loading} />
      </section>

      {isAuthenticated && reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <SectionHeading className="mb-8">
            What Our Customers Say
          </SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}