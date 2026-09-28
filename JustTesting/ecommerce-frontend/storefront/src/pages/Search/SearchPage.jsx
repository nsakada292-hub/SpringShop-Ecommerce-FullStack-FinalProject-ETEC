import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { searchProducts } from "../../services/productService";
import ProductGrid from "../../components/product/ProductGrid";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 1) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await searchProducts(q);
        setResults(res.data || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-sm text-slate-400 mb-4">
        <Link to="/" className="hover:text-brand.blue">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600 dark:text-slate-300">Search</span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
        Search results
      </h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full max-w-md mb-8 px-4 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand.skyBlue/60"
      />

      {query.trim().length >= 1 ? (
        loading ? (
          <p className="text-sm text-slate-400">Searching…</p>
        ) : results.length > 0 ? (
          <ProductGrid products={results} />
        ) : (
          <p className="text-sm text-slate-400 py-10 text-center">
            No results found for “{query.trim()}”
          </p>
        )
      ) : (
        <p className="text-sm text-slate-400">Type a keyword to search.</p>
      )}
    </div>
  );
}