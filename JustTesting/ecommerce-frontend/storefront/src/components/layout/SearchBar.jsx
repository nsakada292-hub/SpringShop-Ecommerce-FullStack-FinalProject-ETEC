import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { searchProducts } from "../../services/productService";
import { formatPrice } from "../../utils/productMapping";

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open || query.trim().length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchProducts(query.trim());
        setResults(res.data.slice(0, 6));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  const goToSearch = () => {
    const q = query.trim();
    if (q.length < 1) return;
    setOpen(false);
    setQuery("");
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={ref} className="relative flex items-center">
      {open ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goToSearch();
            }}
            placeholder="Search products..."
            className="w-48 md:w-64 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand.skyBlue/60"
          />
          <button
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close search"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {open && results.length > 0 && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
              <div className="p-2 border-b border-slate-100 dark:border-slate-700 text-xs text-slate-500">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </div>
              {results.map((p) => (
                <Link
                  key={p.id}
                  to={`/product/${p.id}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <img
                    src={p.image || "/placeholder.png"}
                    alt={p.name}
                    className="h-10 w-10 object-cover rounded"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-brand.blue">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
              <button
                onClick={goToSearch}
                className="w-full text-left px-3 py-2 text-sm font-medium text-brand.blue dark:text-brand.aqua hover:bg-slate-50 dark:hover:bg-slate-800 border-t border-slate-100 dark:border-slate-700"
              >
                View all results →
              </button>
            </div>
          )}

          {open && query.trim().length >= 2 && loading && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-xl p-4 text-sm text-slate-400">
              Loading...
            </div>
          )}

          {open && query.trim().length >= 2 && !loading && results.length === 0 && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-xl p-4 text-sm text-slate-400">
              No results found
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:text-brand.blue dark:hover:text-brand.aqua transition"
          aria-label="Search"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      )}
    </div>
  );
}