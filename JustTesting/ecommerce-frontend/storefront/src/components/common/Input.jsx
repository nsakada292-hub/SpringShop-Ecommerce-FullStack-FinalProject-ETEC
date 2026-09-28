import { cn } from "../../utils/helpers";

export default function Input({
  label,
  error,
  className,
  containerClassName,
  id,
  ...props
}) {
  return (
    <div className={cn("w-full", containerClassName)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand.skyBlue/60 focus:border-brand.skyBlue transition",
          error
            ? "border-red-500"
            : "border-slate-300 dark:border-slate-600",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
