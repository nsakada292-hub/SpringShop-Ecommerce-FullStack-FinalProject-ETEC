import { Link } from "react-router-dom";
import useScrollLock from "../../hooks/useScrollLock";
import BrandLogo from "../common/BrandLogo";

export default function MobileMenu({ open, onClose }) {
  useScrollLock(open);

  if (!open) return null;

  const nav = [
    { label: "Home", to: "/" },
    { label: "Women", to: "/category/women" },
    { label: "Men", to: "/category/men" },
    { label: "Kid", to: "/category/kid" },
    { label: "Beauty", to: "/category/beauty" },
    { label: "Sign In", to: "/sign-in" },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 shadow-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <BrandLogo className="text-xl" onClick={onClose} />
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200"
            aria-label="Close menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="block px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand.blue dark:hover:text-brand.aqua"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
