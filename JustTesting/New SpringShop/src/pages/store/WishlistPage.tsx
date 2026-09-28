import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { ProductCard } from '../../components/product/ProductCard';
import { Button } from '../../components/common/Button';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { success } = useToast();

  const handleMoveAllToBag = async () => {
    for (const prod of wishlist) {
      await addToCart(prod.id, 1);
    }
    success(`Moved all ${wishlist.length} saved items to your shopping bag!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              Your Love List
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved for future purchase.
          </p>
        </div>

        {wishlist.length > 0 && (
          <Button
            variant="primary"
            size="md"
            onClick={handleMoveAllToBag}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Move All to Bag</span>
          </Button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/30 max-w-xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            You haven't saved any items yet
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto mb-6">
            Tap the heart icon on any product card while browsing to save it to this list.
          </p>
          <Link
            to="/"
            className="btn-primary-gradient px-6 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2"
          >
            <span>Explore Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
