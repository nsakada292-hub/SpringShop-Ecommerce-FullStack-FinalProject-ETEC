import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { useCategories } from '../../../hooks/useCategories';
import { CategoryDropdown } from './CategoryDropdown';
import { SearchBar } from './SearchBar';
import {
  ShoppingBag,
  Heart,
  Search,
  Sun,
  Moon,
  User as UserIcon,
  Menu,
  X,
  Languages,
  LayoutDashboard,
  LogOut,
  Package,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, language, toggleLanguage, isKhmer } = useTheme();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, openCartDrawer, isPulsing } = useCart();
  const { wishlistCount, openWishlistDrawer } = useWishlist();
  const { topLevelCategories, getSubcategories } = useCategories();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Left: Mobile Menu Toggle & Brand Logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white rounded-lg transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-black text-base shadow-sm group-hover:shadow-md transition-all">
                  S
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                    Spring<span className="text-[#009dff]">Shop</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[#00e000] font-bold">
                    {isKhmer ? 'ហាងអនឡាញ' : 'E-Commerce'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Center: Nav links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-7">
              <Link
                to="/"
                className={`text-sm font-medium transition-colors hover:text-[#009dff] dark:hover:text-[#00e1ff] ${
                  location.pathname === '/' ? 'text-[#009dff] dark:text-[#00e1ff] font-semibold' : 'text-zinc-700 dark:text-zinc-200'
                }`}
              >
                {isKhmer ? 'ទំព័រដើម' : 'Home'}
              </Link>

              {topLevelCategories.map(cat => (
                <CategoryDropdown
                  key={cat.id}
                  category={cat}
                  subcategories={getSubcategories(cat.id)}
                  isKhmer={isKhmer}
                />
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              
              {/* Language Switcher (EN / KM) showcasing Lexend vs Kantumruy Pro */}
              <button
                type="button"
                onClick={toggleLanguage}
                title="Toggle Khmer / English font & language"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <Languages className="w-3.5 h-3.5 text-[#009dff]" />
                <span>{language === 'en' ? 'EN' : 'ខ្មែរ'}</span>
              </button>

              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist / Love List Drawer Toggle */}
              <button
                type="button"
                onClick={openWishlistDrawer}
                className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Drawer Toggle with pulse animation */}
              <button
                type="button"
                onClick={openCartDrawer}
                className={`relative p-2 text-zinc-600 dark:text-zinc-300 hover:text-[#009dff] dark:hover:text-[#00e1ff] rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all ${
                  isPulsing ? 'scale-125 text-[#00e000]' : ''
                }`}
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-brand-gradient text-white text-[10px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle (Sun/Moon) */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* User Sign In / Profile Avatar */}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 pl-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#009dff] text-white flex items-center justify-center font-bold text-[11px]">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 backdrop-blur-md"
                      >
                        <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                          <p className="text-xs text-zinc-400 font-medium">Signed in as</p>
                          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isAdmin ? 'bg-[#00e1ff]/15 text-[#009dff]' : 'bg-[#4ce600]/15 text-[#00e000]'
                          }`}>
                            {user.role}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            to="/orders/me"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Package className="w-4 h-4 text-zinc-400" />
                            <span>My Orders</span>
                          </Link>

                          {isAdmin && (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#009dff] hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors"
                            >
                              <LayoutDashboard className="w-4 h-4 text-[#009dff]" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                        </div>

                        <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  to="/sign-in"
                  className="btn-primary-gradient px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{isKhmer ? 'ចូលគណនី' : 'Sign in'}</span>
                </Link>
              )}

            </div>
          </div>
        </div>

        {/* Expandable SearchBar */}
        <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-2"
            >
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                {isKhmer ? 'ទំព័រដើម' : 'Home'}
              </Link>
              {topLevelCategories.map(cat => (
                <div key={cat.id} className="py-1">
                  <Link
                    to={`/category/${cat.categoryName.toLowerCase()}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-semibold text-sm text-[#009dff]"
                  >
                    {cat.categoryName}
                  </Link>
                  <div className="pl-3 mt-1 flex flex-wrap gap-2">
                    {getSubcategories(cat.id).map(sub => (
                      <Link
                        key={sub.id}
                        to={`/category/${cat.categoryName.toLowerCase()}?type=${encodeURIComponent(sub.categoryName.toLowerCase())}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-xs px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-600 dark:text-zinc-300"
                      >
                        {sub.categoryName}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              {isAdmin && (
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-sm font-semibold text-[#009dff]"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Open Admin Dashboard</span>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
