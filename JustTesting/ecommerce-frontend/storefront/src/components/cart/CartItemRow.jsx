import { useState } from "react";
import { useCart } from "../../hooks/useCart";
import PriceTag from "../common/PriceTag";

export default function CartItemRow({ item }) {
  const { updateItem, removeItem } = useCart();
  const [updating, setUpdating] = useState(false);

  const name = item.name || item.productName || item.product?.name || "Product";
  const price = Number(item.price ?? item.productPrice ?? item.product?.price ?? 0);
  const image = item.image || item.product?.image || "/placeholder.png";
  const linePrice = price * (item.quantity || 1);

  const changeQty = async (delta) => {
    const newQty = (item.quantity || 1) + delta;
    if (newQty < 1) return;
    setUpdating(true);
    try {
      await updateItem(item.id, newQty);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex gap-3 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <img
        src={image}
        alt={name}
        className="h-20 w-16 object-cover rounded-lg bg-slate-100 dark:bg-slate-700"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">
            {name}
          </h4>
          <button
            onClick={() => removeItem(item.id)}
            className="text-slate-400 hover:text-red-500 shrink-0"
            aria-label="Remove item"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {(item.size || item.color) && (
          <p className="mt-0.5 text-xs text-slate-400">
            {[item.color, item.size].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center border border-slate-200 dark:border-slate-600 rounded-lg">
            <button
              onClick={() => changeQty(-1)}
              disabled={updating || (item.quantity || 1) <= 1}
              className="px-2 py-1 text-slate-500 hover:text-brand.blue disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-2 text-sm font-medium text-slate-900 dark:text-white">
              {item.quantity}
            </span>
            <button
              onClick={() => changeQty(1)}
              disabled={updating}
              className="px-2 py-1 text-slate-500 hover:text-brand.blue disabled:opacity-30"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <PriceTag value={linePrice} className="text-sm" />
        </div>
      </div>
    </div>
  );
}