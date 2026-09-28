import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { getCategoryTree } from "../../services/categoryService";
import { getProducts } from "../../services/productService";
import { rowsForType, productInSubcategory } from "../../utils/categoryUtils";
import ProductGrid from "../../components/product/ProductGrid";
import Loader from "../../components/common/Loader";

const TYPE_LABELS = {
  women: "Women",
  men: "Men",
  kid: "Kid",
  beauty: "Beauty",
};

function FilterSidebar({ type, tree, selected, onToggle, onClear }) {
  const rows = rowsForType(tree, type);

  return (
    <aside className="w-full lg:w-56 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Filters</h3>
        {selected.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-brand.blue dark:text-brand.aqua hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
      <div className="space-y-2">
        {rows.map((row) => {
          const key = row.isDefault ? row.name : row.name;
          const checked = selected.includes(key);
          return (
            <label
              key={`${row.isDefault}-${key}`}
              className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300 hover:text-brand.blue"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(key)}
                className="h-4 w-4 rounded border-slate-300 text-brand.blue focus:ring-brand.skyBlue/60"
              />
              {key}
            </label>
          );
        })}
      </div>
    </aside>
  );
}

export default function CategoryListingPage() {
  const { type, subcategory } = useParams();
  const [selected, setSelected] = useState([]);
  const [products, setProducts] = useState([]);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (subcategory) {
      setSelected((prev) => (prev.includes(subcategory) ? prev : [...prev, subcategory]));
    } else {
      setSelected([]);
    }
  }, [subcategory, type]);

  useEffect(() => {
    let active = true;
    getCategoryTree()
      .then((t) => {
        if (active) setTree(t);
      })
      .catch(() => {
        if (active) setTree([]);
      });
    return () => {
      active = false;
    };
  }, [type]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const all = res.data || [];
      setProducts(
        selected.length > 0
          ? all.filter((p) =>
              selected.some((s) => productInSubcategory(tree, type, s, p))
            )
          : all.filter((p) => productInSubcategory(tree, type, null, p))
      );
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [tree, type, selected]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleToggle = (slug) => {
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const title = subcategory
    ? `${TYPE_LABELS[type] || type} · ${subcategory}`
    : TYPE_LABELS[type] || type;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          type={type}
          tree={tree}
          selected={selected}
          onToggle={handleToggle}
          onClear={() => setSelected([])}
        />

        <div className="flex-1">
          <div className="mb-6">
            <nav className="text-sm text-slate-400 mb-1">
              <Link to="/" className="hover:text-brand.blue">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link
                to={`/category/${type}`}
                className="hover:text-brand.blue capitalize"
              >
                {TYPE_LABELS[type] || type}
              </Link>
              {subcategory && (
                <>
                  <span className="mx-2">/</span>
                  <span className="capitalize text-slate-600 dark:text-slate-300">
                    {subcategory}
                  </span>
                </>
              )}
            </nav>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white capitalize">
              {title}
            </h1>
            {selected.length > 0 && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selected.length} filter{selected.length > 1 ? "s" : ""} applied
              </p>
            )}
          </div>

          <ProductGrid products={products} loading={loading} />
        </div>
      </div>
    </div>
  );
}