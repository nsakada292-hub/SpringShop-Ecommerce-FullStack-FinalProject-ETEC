import { cn } from "../../utils/helpers";

export default function EmptyState({
  icon,
  title,
  description,
  children,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        className
      )}
    >
      {icon && (
        <div className="text-slate-200 dark:text-slate-700 mb-4">{icon}</div>
      )}
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
