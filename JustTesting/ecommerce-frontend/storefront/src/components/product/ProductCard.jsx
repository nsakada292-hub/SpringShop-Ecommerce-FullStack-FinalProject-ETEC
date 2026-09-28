import { Link } from "react-router-dom";
import { useWishlist } from "../../hooks/useWishlist";
import PriceTag from "../common/PriceTag";
import Badge from "../common/Badge";

export default function ProductCard({ product, className }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isLoved = isInWishlist(product.id);

  const image = product.image || product.images?.[0] || "/placeholder.png";
  const inStock = product.inStock ?? product.stock > 0;
  const details = [product.color, product.size].filter(Boolean).join(" · ");

  const handleLove = (e) => {
    e.preventDefault();
    toggleWishlist(product.id, product);
  };

  return (
    <div className={`group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-lg hover:shadow-brand.blue/10 transition ${className || ""}`}>
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-700">
        <img
          src={image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <Badge color={inStock ? "lime" : "slate"} className="absolute top-2 left-2">
          {inStock ? "In Stock" : "Out of Stock"}
        </Badge>
      </Link>

      <button
        onClick={handleLove}
        className="absolute top-2 right-2 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 shadow hover:scale-110 transition"
        aria-label={isLoved ? "Remove from love list" : "Add to love list"}
      >
        <svg
          className={`h-5 w-5 ${isLoved ? "text-brand.limeGreen fill-current" : "text-slate-400"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand.blue dark:group-hover:text-brand.aqua transition">
            {product.name}
          </h3>
        </Link>
        {product.categoryName && (
          <p className="mt-0.5 text-xs text-slate-400 capitalize">
            {product.categoryName}
          </p>
        )}
        {details && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{details}</p>
        )}
        <div className="mt-2">
          <PriceTag value={product.price} />
        </div>
      </div>
    </div>
  );
}