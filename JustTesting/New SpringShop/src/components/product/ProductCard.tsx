import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Heart, ShoppingBag } from 'lucide-react';
import { Badge } from '../common/Badge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isLoved, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const loved = isLoved(product.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(product.id, 1);
  };

  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 15;
  const isOutOfStock = product.stockQuantity === 0;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
      <Link to={`/product/${product.id}`} className="relative block aspect-4/5 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        <img
          src={product.image}
          alt={product.productName}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.stockQuantity > 30 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#00e000] text-zinc-950 uppercase tracking-wider shadow-xs">
              New
            </span>
          )}
          {isLowStock && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider shadow-xs">
              Low Stock ({product.stockQuantity})
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-white uppercase tracking-wider shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Love list heart toggle */}
        <button
          type="button"
          onClick={handleHeartClick}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            loved
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label={loved ? 'Remove from love list' : 'Add to love list'}
        >
          <Heart className={`w-4 h-4 ${loved ? 'fill-white' : ''}`} />
        </button>

        {/* Quick Add To Bag overlay on hover */}
        {!isOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              type="button"
              onClick={handleQuickAdd}
              className="w-full py-2.5 px-3 rounded-xl btn-primary-gradient text-xs font-semibold shadow-lg flex items-center justify-center gap-1.5 active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Quick Add to Bag</span>
            </button>
          </div>
        )}
      </Link>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">
          {product.category?.categoryName || 'Apparel'}
        </span>
        <Link
          to={`/product/${product.id}`}
          className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-[#009dff] dark:hover:text-[#00e1ff] line-clamp-1 transition-colors"
        >
          {product.productName}
        </Link>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1">
          {product.color}
        </p>

        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            ${product.price.toFixed(2)}
          </span>
          <span className="text-[11px] font-medium text-[#00b000] dark:text-[#4ce600]">
            In Stock
          </span>
        </div>
      </div>
    </div>
  );
};
