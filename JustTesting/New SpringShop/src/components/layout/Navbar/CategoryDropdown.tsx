import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../../types';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryDropdownProps {
  category: Category;
  subcategories: Category[];
  isKhmer?: boolean;
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  category,
  subcategories,
  isKhmer = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const slug = category.categoryName.toLowerCase();

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        to={`/category/${slug}`}
        onClick={() => setIsOpen(false)}
        className="flex items-center gap-1.5 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:text-[#009dff] dark:hover:text-[#00e1ff] transition-colors"
      >
        <span>{category.categoryName}</span>
        {subcategories.length > 0 && (
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#009dff]' : 'text-zinc-400'}`}
          />
        )}
      </Link>

      <AnimatePresence>
        {isOpen && subcategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 z-40 min-w-[200px] pt-1"
          >
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-2.5 backdrop-blur-md">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                {category.categoryName} Categories
              </div>
              <div className="flex flex-col gap-0.5">
                {subcategories.map(sub => (
                  <Link
                    key={sub.id}
                    to={`/category/${slug}?type=${encodeURIComponent(sub.categoryName.toLowerCase())}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-[#009dff] dark:hover:text-[#00e1ff] transition-colors"
                  >
                    <span>{sub.categoryName}</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-zinc-500">→</span>
                  </Link>
                ))}
                <div className="pt-1 mt-1 border-t border-zinc-100 dark:border-zinc-800/80">
                  <Link
                    to={`/category/${slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-1.5 text-[11px] font-semibold text-[#009dff] hover:underline"
                  >
                    Browse All {category.categoryName}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
