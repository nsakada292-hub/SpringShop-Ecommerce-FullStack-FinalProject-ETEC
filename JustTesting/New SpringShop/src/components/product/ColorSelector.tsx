import React from 'react';

interface ColorSelectorProps {
  colorsString: string;
  selectedColor: string;
  onChange: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colorsString,
  selectedColor,
  onChange,
}) => {
  const colors = colorsString
    ? colorsString.split(',').map(c => c.trim()).filter(Boolean)
    : ['Default'];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
          Color Variant
        </span>
        <span className="text-xs text-zinc-400">
          Selected: <strong className="text-zinc-900 dark:text-zinc-100">{selectedColor || colors[0]}</strong>
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {colors.map(col => {
          const isSelected = (selectedColor || colors[0]) === col;
          return (
            <button
              key={col}
              type="button"
              onClick={() => onChange(col)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#009dff] bg-[#009dff]/10 text-[#009dff] dark:text-[#00e1ff] shadow-xs ring-2 ring-[#009dff]/20'
                  : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500'
              }`}
            >
              {col}
            </button>
          );
        })}
      </div>
    </div>
  );
};
