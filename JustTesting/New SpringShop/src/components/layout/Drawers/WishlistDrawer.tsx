import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../common/Button';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistDrawerOpen, closeWishlistDrawer, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (product: any) => {
    await addToCart(product.id, 1);
    await toggleWishlist(product);
  };

  return (
    <AnimatePresence>
      {isWishlistDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeWishlistDrawer}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                    <Heart className="w-4 h-4 fill-current" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Your Love List ({wishlist.length})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeWishlistDrawer}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Close Love List drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-zinc-100 dark:divide-zinc-800">
                {wishlist.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-400 flex items-center justify-center mb-4">
                      <Heart className="w-8 h-8" />
                    </div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                      Your love list is empty
                    </p>
                    <p className="text-xs text-zinc-400 max-w-xs mb-6">
                      Explore our collections and tap the heart on any item you love to save it here.
                    </p>
                    <Link
                      to="/"
                      onClick={closeWishlistDrawer}
                      className="btn-primary-gradient px-4 py-2 rounded-xl text-xs font-semibold"
                    >
                      Start Exploring
                    </Link>
                  </div>
                ) : (
                  wishlist.map(product => (
                    <div key={product.id} className="py-4 flex gap-4 items-center group">
                      <Link
                        to={`/product/${product.id}`}
                        onClick={closeWishlistDrawer}
                        className="w-16 h-20 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800"
                      >
                        <img
                          src={product.image}
                          alt={product.productName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${product.id}`}
                          onClick={closeWishlistDrawer}
                          className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-[#009dff] truncate block"
                        >
                          {product.productName}
                        </Link>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {product.category.categoryName} • ${product.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            type="button"
                            onClick={() => handleMoveToCart(product)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#00e1ff]/15 text-[#009dff] hover:bg-[#00e1ff]/25 transition-colors"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Move to Bag</span>
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => toggleWishlist(product)}
                        className="p-1.5 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Remove from love list"
                      >
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              {wishlist.length > 0 && (
                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <Link
                    to="/wishlist"
                    onClick={closeWishlistDrawer}
                    className="flex items-center justify-center gap-2 w-full py-2.5 text-xs font-semibold text-[#009dff] hover:underline"
                  >
                    <span>View all loved items on full page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </motion.aside>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
