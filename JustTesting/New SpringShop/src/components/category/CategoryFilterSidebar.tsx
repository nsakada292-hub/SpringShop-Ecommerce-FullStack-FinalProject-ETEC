import React from 'react';
import { Category } from '../../types';
import { Filter, RotateCcw, Check } from 'lucide-react';

interface CategoryFilterSidebarProps {
  categoryName: string;
  subcategories: Category[];
  selectedTypes: string[];
  onToggleType: (typeName: string) => void;
  maxPrice: number;
  onPriceChange: (price: number) => void;
  inStockOnly: boolean;
  onToggleInStock: () => void;
  onReset: () => void;
}

export const CategoryFilterSidebar: React.FC<CategoryFilterSidebarProps> = ({
  categoryName,
  subcategories,
  selectedTypes,
  onToggleType,
  maxPrice,
  onPriceChange,
  inStockOnly,
  onToggleInStock,
  onReset,
}) => {
  const hasActiveFilters = selectedTypes.length > 0 || maxPrice < 300 || inStockOnly;

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#009dff]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-[#009dff] hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Subtypes / Subcategories */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
          {categoryName} Subcategories
        </h3>
        {subcategories.length === 0 ? (
          <p className="text-xs text-zinc-400">No subcategories available</p>
        ) : (
          <div className="space-y-2">
            {subcategories.map(sub => {
              const checked = selectedTypes.includes(sub.categoryName.toLowerCase());
              return (
                <label
                  key={sub.id}
                  className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer select-none group"
                >
                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                      checked
                        ? 'bg-[#009dff] border-[#009dff] text-white'
                        : 'border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400'
                    }`}
                  >
                    {checked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleType(sub.categoryName.toLowerCase())}
                    className="sr-only"
                  />
                  <span>{sub.categoryName}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Max Price
          </span>
          <span className="font-bold text-[#009dff]">${maxPrice}</span>
        </div>
        <input
          type="range"
          min="20"
          max="300"
          step="5"
          value={maxPrice}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#009dff]"
        />
        <div className="flex justify-between text-[11px] text-zinc-400">
          <span>$20</span>
          <span>$300+</span>
        </div>
      </div>

      {/* Stock Status */}
      <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <label className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
          <div
            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
              inStockOnly
                ? 'bg-[#00e000] border-[#00e000] text-zinc-950 font-bold'
                : 'border-zinc-300 dark:border-zinc-700'
            }`}
          >
            {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={onToggleInStock}
            className="sr-only"
          />
          <span className="font-medium">In-Stock items only</span>
        </label>
      </div>
    </aside>
  );
};
