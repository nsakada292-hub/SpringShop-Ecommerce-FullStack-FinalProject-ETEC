import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../common/Button';

export const CartDrawer: React.FC = () => {
  const { items, totalAmount, isCartDrawerOpen, closeCartDrawer, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCartDrawer();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartDrawer}
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
                  <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#009dff] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={closeCartDrawer}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Close Shopping Bag drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 divide-y divide-zinc-100 dark:divide-zinc-800">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <p className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                      Your bag is empty
                    </p>
                    <p className="text-xs text-zinc-400 max-w-xs mb-6">
                      Discover our curated collections and add your favorite pieces to your bag.
                    </p>
                    <Link
                      to="/"
                      onClick={closeCartDrawer}
                      className="btn-primary-gradient px-4 py-2 rounded-xl text-xs font-semibold"
                    >
                      Shop New Arrivals
                    </Link>
                  </div>
                ) : (
                  items.map(item => (
                    <div key={item.id} className="py-4 flex gap-4 items-start group">
                      <img
                        src={item.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                        alt={item.productName}
                        className="w-16 h-20 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-800"
                      />

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          onClick={closeCartDrawer}
                          className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-[#009dff] truncate block"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                          ${item.productPrice.toFixed(2)} each
                        </p>

                        {/* Quantity Stepper & Subtotal */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 py-0.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            ${item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Remove item */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-zinc-400 hover:text-rose-500 rounded transition-colors"
                        title="Remove from bag"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer with Subtotal and Checkout */}
              {items.length > 0 && (
                <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Subtotal</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Estimated Shipping</span>
                      <span className="text-[#00e000] font-medium">
                        {totalAmount >= 75 ? 'FREE' : '$5.00'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <span>Total</span>
                      <span className="text-[#009dff] text-base">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="primary"
                      onClick={handleCheckout}
                      className="w-full py-3"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    <Link
                      to="/cart"
                      onClick={closeCartDrawer}
                      className="block text-center text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-[#009dff] dark:hover:text-[#00e1ff] py-1"
                    >
                      View full bag & calculate tax
                    </Link>
                  </div>
                </div>
              )}
            </motion.aside>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
