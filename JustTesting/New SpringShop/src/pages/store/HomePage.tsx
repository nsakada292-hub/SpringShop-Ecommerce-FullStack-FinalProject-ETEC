import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Product, Review } from '../../types';
import { productApi } from '../../api/productApi';
import { reviewApi } from '../../api/reviewApi';
import { useCategories } from '../../hooks/useCategories';
import { ProductGrid } from '../../components/product/ProductGrid';
import { ReviewList } from '../../components/review/ReviewList';
import { useTheme } from '../../context/ThemeContext';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { topLevelCategories } = useCategories();
  const { isKhmer } = useTheme();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [allProds, reviews] = await Promise.all([
          productApi.getAll({ limit: 12 }),
          reviewApi.getAll()
        ]);
        setFeaturedProducts(allProds.slice(0, 4));
        setNewArrivals(allProds.slice(4, 8));
        setRecentReviews(reviews.slice(0, 3));
      } catch (err) {
        console.error('Home page load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Hero Section with Brand Gradient & Refined Typography */}
      <section className="relative overflow-hidden bg-zinc-950 text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-[#4ce600] via-[#009dff] to-transparent blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#00e1ff] text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isKhmer ? 'ការប្រមូលរដូវផ្ការីក ២០២៦' : 'Spring / Summer 2026 Collection'}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              {isKhmer ? (
                <>
                  រចនាប័ទ្មទាន់សម័យ <br />
                  <span className="bg-clip-text text-transparent bg-brand-gradient">
                    សម្រាប់ជីវិតរស់នៅប្រចាំថ្ងៃ
                  </span>
                </>
              ) : (
                <>
                  Refined Essentials <br />
                  <span className="bg-clip-text text-transparent bg-brand-gradient">
                    for Thoughtful Living.
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
              Discover artisan-crafted linen silhouettes, Italian leather footwear, and clean botanical skincare formulated with natural ingredients.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                to="/category/women"
                className="btn-primary-gradient px-6 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <span>{isKhmer ? 'ទិញទំនិញនារី' : 'Shop Women'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/category/men"
                className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
              >
                <span>{isKhmer ? 'ទិញទំនិញបុរស' : 'Shop Men'}</span>
              </Link>
            </div>
          </div>

          {/* Hero Visual Imagery */}
          <div className="relative w-full max-w-md lg:max-w-lg aspect-4/5 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=80"
              alt="SpringShop Fashion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 sm:p-8">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#4ce600]">Editorial Capsule</span>
              <p className="text-lg font-bold text-white mt-1">The Pure Linen Relaxed Suit</p>
              <p className="text-xs text-zinc-300 mt-1">$139.00 • In Stock</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {isKhmer ? 'ជ្រើសរើសតាមប្រភេទ' : 'Explore Collections'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Curated department departments crafted for effortless curation.
            </p>
          </div>
          <Link
            to="/category/all"
            className="text-xs font-semibold text-[#009dff] hover:underline flex items-center gap-1"
          >
            <span>View all collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {topLevelCategories.map(cat => {
            const images: { [key: string]: string } = {
              women: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80',
              men: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80',
              beauty: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80',
              kid: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80',
            };
            const catKey = cat.categoryName.toLowerCase();
            const bgImage = images[catKey] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80';

            return (
              <Link
                key={cat.id}
                to={`/category/${catKey}`}
                className="group relative aspect-4/5 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-zinc-200 dark:border-zinc-800"
              >
                <img
                  src={bgImage}
                  alt={cat.categoryName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#00e1ff] transition-colors">
                    {cat.categoryName}
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5 line-clamp-1">
                    {cat.description || 'Explore collection'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Curated Drop: Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#00e000]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#00b000] dark:text-[#4ce600]">
                Trending Now
              </span>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
              Curated Seasonal Drops
            </h2>
          </div>
          <Link
            to="/category/all"
            className="text-xs font-semibold text-[#009dff] hover:underline flex items-center gap-1"
          >
            <span>See entire catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} loading={loading} />
      </section>

      {/* Value Proposition Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#009dff]">
              Sustainable Craftsmanship
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Ethical sourcing. Organic fibers. Built to last generations.
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every garment in our catalog is created in partnership with certified fair-trade mills, utilizing 100% biodegradable natural flax, organic cotton, and vegetable-tanned hides.
            </p>
          </div>
          <Link
            to="/category/beauty"
            className="btn-primary-gradient px-6 py-3 rounded-xl text-xs font-bold shrink-0"
          >
            Discover Botanical Care
          </Link>
        </div>
      </section>

      {/* New Arrivals Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              New Arrivals
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Fresh silhouettes and accessories just landed in stock.
            </p>
          </div>
        </div>

        <ProductGrid products={newArrivals} loading={loading} />
      </section>

      {/* Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReviewList
          reviews={recentReviews}
          averageRating={4.9}
          title="Community Thoughts"
          subtitle="Real reviews from customers who purchased our pieces"
        />
      </section>
    </div>
  );
};
