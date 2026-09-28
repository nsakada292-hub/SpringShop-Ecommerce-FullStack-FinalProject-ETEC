import { cn } from "../../utils/helpers";

export default function CloseButton({ onClick, className, size = 5 }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition",
        className
      )}
      aria-label="Close"
    >
      <svg
        className={`h-${size} w-${size}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}
