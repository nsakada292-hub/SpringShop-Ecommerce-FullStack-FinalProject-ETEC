import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { getCategoryTree } from "../../services/categoryService";
import { findTypeRoot, rowsForType } from "../../utils/categoryUtils";

export default function CategoryDropdown({ label, type }) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    getCategoryTree()
      .then((tree) => {
        if (!active) return;
        const root = findTypeRoot(tree, type);
        setRows(rowsForType(tree, type));
        if (root && root.children && root.children.length > 0) {
          setRows(root.children.map((c) => c.categoryName));
        }
      })
      .catch(() => {
        if (active) setRows(rowsForType(null, type));
      });
    return () => {
      active = false;
    };
  }, [open, type]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-brand.blue dark:hover:text-brand.aqua transition">
        {label}
        <svg
          className="inline-block h-3 w-3 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 py-2">
          <Link
            to={`/category/${type}`}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm font-medium text-brand.blue dark:text-brand.aqua hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            All {label}
          </Link>
          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
          {rows.map((row) => (
            <Link
              key={row}
              to={`/category/${type}/${encodeURIComponent(row.toLowerCase())}`}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-brand.blue"
            >
              {row}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}