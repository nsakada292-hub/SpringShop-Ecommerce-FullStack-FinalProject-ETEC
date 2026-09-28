import { cn } from "../../utils/helpers";

export default function SizeSelector({ sizes = [], value, onChange, required }) {
  if (!sizes || sizes.length === 0) return null;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Size {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onChange(size)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-lg border transition",
              value === size
                ? "bg-brand.blue text-white border-brand.blue"
                : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-brand.blue hover:text-brand.blue"
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}
