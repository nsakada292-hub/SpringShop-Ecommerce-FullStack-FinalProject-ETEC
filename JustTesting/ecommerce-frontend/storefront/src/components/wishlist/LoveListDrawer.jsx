import { useWishlist } from "../../hooks/useWishlist";
import PriceTag from "../common/PriceTag";
import Loader from "../common/Loader";
import CloseButton from "../common/CloseButton";
import EmptyState from "../common/EmptyState";
import useScrollLock from "../../hooks/useScrollLock";
import { Link } from "react-router-dom";

function WishlistItemRow({ product }) {
  const { toggleWishlist } = useWishlist();
  const image = product.images?.[0] || product.image || "/placeholder.png";

  return (
    <div className="flex gap-3 py-4 border-b border-slate-100 dark:border-slate-700 last:border-0">
      <Link to={`/product/${product.id}`}>
        <img
          src={image}
          alt={product.name}
          className="h-20 w-16 object-cover rounded-lg bg-slate-100 dark:bg-slate-700"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/product/${product.id}`}>
          <h4 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 hover:text-brand.blue">
            {product.name}
          </h4>
        </Link>
        <div className="mt-1">
          <PriceTag value={product.price} className="text-sm" />
        </div>
      </div>
      <button
        onClick={() => toggleWishlist(product.id)}
        className="text-red-500 hover:opacity-70 self-start"
        aria-label="Remove from love list"
      >
        <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
    </div>
  );
}

export default function LoveListDrawer({ open, onClose }) {
  const { products, loading } = useWishlist();

  useScrollLock(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Love List
          </h2>
          <CloseButton onClick={onClose} />
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <EmptyState
              className="h-full"
              icon={
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
              title="No items in your love list yet"
            >
              <button onClick={onClose} className="text-sm text-brand.blue dark:text-brand.aqua font-medium">
                Browse products
              </button>
            </EmptyState>
          ) : (
            products.map((product) => (
              <WishlistItemRow key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
