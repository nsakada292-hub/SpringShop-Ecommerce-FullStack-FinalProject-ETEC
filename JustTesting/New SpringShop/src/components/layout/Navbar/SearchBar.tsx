import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productApi } from '../../../api/productApi';
import { Product } from '../../../types';

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await productApi.search(query.trim());
        setResults(data.slice(0, 5));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/category/all?search=${encodeURIComponent(query.trim())}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md overflow-hidden z-30"
        >
          <div className="max-w-4xl mx-auto px-4 py-4">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-zinc-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, linen shirts, leather boots, skincare, colors..."
                className="w-full pl-12 pr-12 py-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#009dff] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3.5 p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Quick Live Results */}
            {query.trim() && (
              <div className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading && (
                  <p className="text-xs text-zinc-400 py-2">Searching catalog...</p>
                )}
                {!loading && results.length === 0 && (
                  <p className="text-xs text-zinc-500 py-3 text-center">
                    No products found for "{query}". Press Enter to browse catalog.
                  </p>
                )}
                {!loading && results.map(product => (
                  <div
                    key={product.id}
                    onClick={() => {
                      navigate(`/product/${product.id}`);
                      onClose();
                    }}
                    className="flex items-center gap-3.5 py-2.5 px-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl cursor-pointer transition-colors"
                  >
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="w-10 h-10 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {product.productName}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {product.category.categoryName} • ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
