import React from 'react';

interface SizeSelectorProps {
  sizesString: string;
  selectedSize: string;
  onChange: (size: string) => void;
  stockQuantity: number;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizesString,
  selectedSize,
  onChange,
  stockQuantity,
}) => {
  const sizes = sizesString
    ? sizesString.split(',').map(s => s.trim()).filter(Boolean)
    : ['Standard'];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          Size
        </span>
        <span className="text-xs text-zinc-400">
          Selected: <strong className="text-zinc-900 dark:text-zinc-100">{selectedSize || sizes[0]}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size, index) => {
          const isSelected = (selectedSize || sizes[0]) === size;
          // Example: last size in a low-stock item might be out of stock
          const isOutOfStock = stockQuantity === 0 || (stockQuantity < 5 && index === sizes.length - 1);

          return (
            <button
              key={size}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onChange(size)}
              className={`min-w-[44px] h-11 px-3.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#009dff] bg-[#00e1ff]/10 text-[#009dff] dark:text-[#00e1ff] shadow-xs'
                  : isOutOfStock
                  ? 'border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 line-through cursor-not-allowed bg-zinc-50 dark:bg-zinc-900'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500'
              }`}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};
