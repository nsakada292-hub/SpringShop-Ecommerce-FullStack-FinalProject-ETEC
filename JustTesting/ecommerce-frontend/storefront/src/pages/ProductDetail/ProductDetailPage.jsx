import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getProductById } from "../../services/productService";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import ProductGallery from "../../components/product/ProductGallery";
import SizeSelector from "../../components/product/SizeSelector";
import ColorSelector from "../../components/product/ColorSelector";
import RelatedProducts from "../../components/product/RelatedProducts";
import ReviewList from "../../components/review/ReviewList";
import RatingStars from "../../components/review/RatingStars";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Loader from "../../components/common/Loader";
import PriceTag from "../../components/common/PriceTag";
import { getErrorMessage } from "../../utils/helpers";
import { capitalize } from "../../utils/helpers";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setProduct(null);
    setSize(null);
    setColor(null);
    setError("");
    getProductById(id)
      .then((res) => {
        if (!active) return;
        const p = res.data;
        setProduct(p);
        // Preselect a single option so 'Add to Bag' is one click away.
        if (p.sizes?.length === 1) setSize(p.sizes[0]);
        if (p.colors?.length === 1) setColor(p.colors[0]);
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <Loader />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 mb-4">{error || "Product not found"}</p>
        <Link to="/" className="text-brand.blue dark:text-brand.aqua font-medium">
          Back to Home
        </Link>
      </div>
    );
  }

  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const requiresOptions = sizes.length > 0 || colors.length > 0;
  const canAdd = !requiresOptions || (size && color);
  const isLoved = isInWishlist(product.id);
  const inStock = product.inStock;
  const description = product.description || "";

  const handleAddToBag = async () => {
    setAddError("");
    if (!canAdd) {
      setAddError("Please select a size and color");
      return;
    }
    setAdding(true);
    try {
      await addItem({
        productId: product.id,
        quantity: 1,
        size: size || undefined,
        color: color || undefined,
      });
      navigate("/checkout");
    } catch (err) {
      setAddError(getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-slate-400 mb-6">
        <Link to="/" className="hover:text-brand.blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="capitalize text-slate-600 dark:text-slate-300">
          {product.categoryName || "Shop"}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <ProductGallery images={product.images || []} name={product.name} />

        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              {product.name}
            </h1>
            <button
              onClick={() => toggleWishlist(product.id, product)}
              className={`p-3 rounded-full border transition shrink-0 ${
                isLoved
                  ? "bg-brand.limeGreen/10 border-brand.glowGreen/30 text-brand.glowGreen"
                  : "border-slate-200 dark:border-slate-600 text-slate-400 hover:text-brand.limeGreen"
              }`}
              aria-label={isLoved ? "Remove from love list" : "Add to love list"}
            >
              <svg className="h-6 w-6" fill={isLoved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <PriceTag value={product.price} className="text-2xl" />
            {product.originalPrice != null && product.originalPrice > product.price && (
              <span className="text-sm text-slate-400 line-through">
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
            {inStock ? (
              <Badge color="lime">In Stock</Badge>
            ) : (
              <Badge color="red">Out of Stock</Badge>
            )}
          </div>

          {description && (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {description}
            </p>
          )}

          {product.material && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Material:{" "}
              <span className="text-slate-700 dark:text-slate-200">
                {capitalize(product.material)}
              </span>
            </p>
          )}

          <div className="mt-6 space-y-6">
            {sizes.length > 0 && (
              <SizeSelector
                sizes={sizes}
                value={size}
                onChange={setSize}
                required={colors.length === 0}
              />
            )}
            {colors.length > 0 && (
              <ColorSelector
                colors={colors}
                value={color}
                onChange={setColor}
                required={sizes.length === 0}
              />
            )}

            {requiresOptions && !canAdd && (
              <p className="text-xs text-slate-400">
                Select{" "}
                {!size && sizes.length > 0 ? "a size" : ""}
                {!size && !color && sizes.length > 0 && colors.length > 0 ? " and " : ""}
                {!color && colors.length > 0 ? "a color" : ""}
              </p>
            )}

            {addError && <p className="text-sm text-red-500">{addError}</p>}

            <Button
              onClick={handleAddToBag}
              disabled={!canAdd || !inStock}
              size="lg"
              className="w-full sm:w-auto px-10"
              loading={adding}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {inStock ? "Add to Bag" : "Out of Stock"}
            </Button>
          </div>
        </div>
      </div>

      <RelatedProducts productId={product.id} />

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Reviews
        </h2>
        <ReviewList productId={product.id} />
      </section>
    </div>
  );
}