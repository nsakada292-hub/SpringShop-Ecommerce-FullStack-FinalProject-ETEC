import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import ThemeToggle from "../common/ThemeToggle";
import BrandLogo from "../common/BrandLogo";
import PageContainer from "../common/PageContainer";
import CategoryDropdown from "./CategoryDropdown";
import SearchBar from "./SearchBar";
import BagDrawer from "../cart/BagDrawer";
import LoveListDrawer from "../wishlist/LoveListDrawer";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const [bagOpen, setBagOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setAccountOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <PageContainer className="h-16">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                aria-label="Open menu"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <BrandLogo className="text-xl" />

              <div className="hidden lg:flex items-center space-x-1">
                <Link
                  to="/"
                  className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-brand.blue dark:hover:text-brand.aqua transition"
                >
                  Home
                </Link>
                <CategoryDropdown label="Women" type="women" />
                <CategoryDropdown label="Men" type="men" />
                <CategoryDropdown label="Kid" type="kid" />
                <CategoryDropdown label="Beauty" type="beauty" />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <SearchBar />
              <ThemeToggle />

              <button
                onClick={() => setWishlistOpen(true)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-brand.blue dark:hover:text-brand.aqua transition"
                aria-label="Love list"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 text-[10px] flex items-center justify-center rounded-full bg-brand.limeGreen text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setBagOpen(true)}
                className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-brand.blue dark:hover:text-brand.aqua transition"
                aria-label="Shopping bag"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 text-[10px] flex items-center justify-center rounded-full bg-brand.blue text-white">
                    {totalItems}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div ref={accountRef} className="relative">
                  <button
                    onClick={() => setAccountOpen((v) => !v)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <span className="h-7 w-7 rounded-full bg-lagoon-gradient flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </span>
                    <span className="hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                      {user?.name || user?.email}
                    </span>
                    <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 py-2">
                      <Link
                        to="/account"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Orders
                      </Link>
                      {isAdmin && (
                        <a
                          href={`${import.meta.env.VITE_ADMIN_URL || "http://localhost:5174"}`}
                          onClick={() => setAccountOpen(false)}
                          className="block px-4 py-2 text-sm text-brand.blue dark:text-brand.aqua hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                          Admin Dashboard
                        </a>
                      )}
                      <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Log out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/sign-in"
                  className="ml-1 px-4 py-2 text-sm font-medium text-white bg-lagoon-gradient rounded-lg hover:opacity-90 transition"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </PageContainer>
      </header>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <BagDrawer open={bagOpen} onClose={() => setBagOpen(false)} />
      <LoveListDrawer open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
}
