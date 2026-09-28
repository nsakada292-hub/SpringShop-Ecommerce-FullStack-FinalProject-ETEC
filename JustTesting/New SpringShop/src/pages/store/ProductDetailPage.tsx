import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Review } from '../../types';
import { productApi } from '../../api/productApi';
import { reviewApi } from '../../api/reviewApi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { ProductGallery } from '../../components/product/ProductGallery';
import { SizeSelector } from '../../components/product/SizeSelector';
import { ColorSelector } from '../../components/product/ColorSelector';
import { RelatedProducts } from '../../components/product/RelatedProducts';
import { ReviewList } from '../../components/review/ReviewList';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import {
  Heart,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Star,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Selections
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'reviews'>('details');

  const { addToCart, isUpdating } = useCart();
  const { isLoved, toggleWishlist } = useWishlist();

  const fetchProductData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const prod = await productApi.getById(Number(id));
      setProduct(prod);

      // Default selections
      if (prod.sizes) {
        const firstSize = prod.sizes.split(',')[0]?.trim();
        setSelectedSize(firstSize || '');
      }
      if (prod.color) {
        const firstColor = prod.color.split(',')[0]?.trim();
        setSelectedColor(firstColor || '');
      }

      const revs = await reviewApi.getByProduct(prod.id);
      setReviews(revs);
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Product Not Found</h2>
        <p className="text-xs text-zinc-400 mt-2 mb-6">The item you are looking for may have been archived or removed.</p>
        <Link to="/" className="btn-primary-gradient px-5 py-2.5 rounded-xl text-xs font-semibold">
          Return to Storefront
        </Link>
      </div>
    );
  }

  const loved = isLoved(product.id);
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    await addToCart(product.id, quantity);
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 5.0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-zinc-400">
        <Link to="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link
          to={`/category/${product.category.categoryName.toLowerCase()}`}
          className="hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {product.category.categoryName}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-xs">
          {product.productName}
        </span>
      </nav>

      {/* Main Showcase: Gallery on left, Details on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-7">
          <ProductGallery mainImage={product.image} productName={product.productName} />
        </div>

        {/* Right Column: Info & Purchase Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#009dff]">
              {product.category.categoryName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 leading-tight">
              {product.productName}
            </h1>

            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="text-xs text-zinc-500 hover:text-[#009dff] underline"
              >
                {reviews.length} customer reviews
              </button>
            </div>
          </div>

          {/* Price & Stock Badge */}
          <div className="flex items-baseline gap-4 py-3 border-y border-zinc-200 dark:border-zinc-800">
            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">
              ${product.price.toFixed(2)}
            </span>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isOutOfStock ? 'text-rose-500' : 'text-[#00e000]'
            }`}>
              {isOutOfStock ? 'Sold Out' : `In Stock (${product.stockQuantity} available)`}
            </span>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {product.description}
          </p>

          {/* Color Selector */}
          <ColorSelector
            colorsString={product.color}
            selectedColor={selectedColor}
            onChange={setSelectedColor}
          />

          {/* Size Selector */}
          <SizeSelector
            sizesString={product.sizes}
            selectedSize={selectedSize}
            onChange={setSelectedSize}
            stockQuantity={product.stockQuantity}
          />

          {/* Quantity & CTA buttons */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Quantity
              </span>
              <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                <button
                  type="button"
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={quantity >= product.stockQuantity || isOutOfStock}
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 text-zinc-600 dark:text-zinc-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Add to Bag Button */}
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                isLoading={isUpdating}
                className="flex-1 py-3.5 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
              </Button>

              {/* Love List Toggle Button */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                className={`p-3.5 rounded-xl border transition-all ${
                  loved
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-500 shadow-xs'
                    : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 hover:border-rose-300'
                }`}
                aria-label={loved ? 'Remove from love list' : 'Add to love list'}
              >
                <Heart className={`w-5 h-5 ${loved ? 'fill-rose-500' : ''}`} />
              </button>
            </div>
          </div>

          {/* Perks list */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#009dff] shrink-0" />
              <span>Complimentary expedited delivery on all orders over $75</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#00e000] shrink-0" />
              <span>30-day effortless returns and exchanges in original packaging</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
              <span>Certified authentic and covered by SpringShop craft guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Details, Shipping, Reviews */}
      <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`text-xs font-bold uppercase tracking-wider pb-3 -mb-3 transition-colors ${
              activeTab === 'details'
                ? 'border-b-2 border-[#009dff] text-[#009dff]'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Details & Material Care
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`text-xs font-bold uppercase tracking-wider pb-3 -mb-3 transition-colors ${
              activeTab === 'shipping'
                ? 'border-b-2 border-[#009dff] text-[#009dff]'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Shipping & Returns
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`text-xs font-bold uppercase tracking-wider pb-3 -mb-3 transition-colors ${
              activeTab === 'reviews'
                ? 'border-b-2 border-[#009dff] text-[#009dff]'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
        </div>

        <div className="pt-6">
          {activeTab === 'details' && (
            <div className="max-w-2xl space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                Crafted using premier grade woven textiles selected for resilience, breathability, and timeless drape. Hand-finished hems and reinforced seams guarantee longevity through recurring wash cycles.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Material: 100% natural fibers (responsibly harvested)</li>
                <li>Care: Gentle cold wash on reverse; line dry in shade</li>
                <li>Tailored for a relaxed contemporary drape</li>
                <li>Imported artisanal construction</li>
              </ul>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-2xl space-y-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              <p>
                All orders are dispatched from our regional fulfilment hub within 24 business hours. We partner with express courier networks to ensure swift doorstep arrival.
              </p>
              <div className="space-y-2 text-xs">
                <p>• <strong>Domestic Standard:</strong> 2-3 business days ($5.00, FREE over $75)</p>
                <p>• <strong>Domestic Express:</strong> Next business day ($12.00)</p>
                <p>• <strong>Returns:</strong> 30-day window with pre-printed return label included.</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <ReviewList
              productId={product.id}
              reviews={reviews}
              averageRating={averageRating}
              onReviewAdded={fetchProductData}
              allowAdd={true}
            />
          )}
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts currentProductId={product.id} categoryId={product.category.id} />
    </div>
  );
};
