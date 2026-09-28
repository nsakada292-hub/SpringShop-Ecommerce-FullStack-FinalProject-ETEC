import { formatPrice, cn } from "../../utils/helpers";

export default function PriceTag({ value, className, currency }) {
  return (
    <span className={cn("font-semibold text-slate-900 dark:text-white", className)}>
      {formatPrice(value, currency)}
    </span>
  );
}
