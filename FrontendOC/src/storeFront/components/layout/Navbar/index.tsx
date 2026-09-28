import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  ChevronDown,
  Heart,
  ShoppingBag,
  Sun,
  Moon,
  Menu,
  Package,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'
import { useCategories } from '@/shared/hooks/useCategories'
import { categoriesApi } from '@/shared/api/categories.api'
import type { Category } from '@/shared/types'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { useDrawer } from '@/shared/contexts/DrawerContext'
import { useCart } from '@/shared/contexts/CartContext'
import { useWishlist } from '@/shared/contexts/WishlistContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getInitials } from '@/shared/utils/cn'
import springShopLogo from '@/assets/spring-shop-logo.png'

export default function Navbar() {
  const { topLevel } = useCategories()
  const { theme, toggleTheme } = useTheme()
  const { openCart, openWishlist } = useDrawer()
  const { itemCount } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [subcategories, setSubcategories] = useState<Record<number, Category[]>>({})
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null)

  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  const loadSubcategories = useCallback(async (categoryId: number) => {
    if (subcategories[categoryId]) return
    try {
      const { data } = await categoriesApi.getSubcategories(categoryId)
      setSubcategories((prev) => ({ ...prev, [categoryId]: data }))
    } catch {
      setSubcategories((prev) => ({ ...prev, [categoryId]: [] }))
    }
  }, [subcategories])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setUserMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [searchOpen])

  useEffect(() => {
    const onClick = (e: globalThis.MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setSearchOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setSearchOpen(false)
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    const q = searchKeyword.trim()
    if (!q) return
    navigate(`/category?q=${encodeURIComponent(q)}`)
    setSearchOpen(false)
    setSearchKeyword('')
  }

  const handleSearchKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSearchOpen(false)
      setSearchKeyword('')
    }
  }

  const handleLogout = async () => {
    setUserMenuOpen(false)
    await logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? 'text-[#22c55e]'
        : 'text-gray-700 dark:text-gray-300 hover:text-[#22c55e] dark:hover:text-[#34d399]'
    }`

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ${
          scrolled
            ? 'bg-[#6ee7b7]/90 dark:bg-[#0a0a0c]/90 shadow-lg shadow-emerald-200/40 dark:shadow-black/30 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <nav
          className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-2.5"
            aria-label="SpringShop home"
          >
            <img
              src={springShopLogo}
              alt="SpringShop logo"
              className="h-9 w-auto drop-shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
            />
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Spring<span className="text-[#22c55e]">Shop</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 lg:flex">
            <NavLink
              to="/"
              end
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={navLinkClass}
            >
              Home
            </NavLink>
            {topLevel.map((category) => (
              <div
                key={category.id}
                className="relative"
                onMouseEnter={() => {
                  setHoveredCategory(category.id)
                  loadSubcategories(category.id)
                }}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  to={`/category/${category.id}`}
                  onMouseEnter={() => loadSubcategories(category.id)}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-[#22c55e] dark:text-gray-300 dark:hover:text-[#34d399]"
                >
                  {category.categoryName}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      hoveredCategory === category.id ? 'rotate-180' : ''
                    }`}
                  />
                </Link>

                <div
                  className={`absolute left-0 top-full pt-2 transition-all duration-200 ${
                    hoveredCategory === category.id
                      ? 'visible translate-y-0 opacity-100'
                      : 'invisible -translate-y-1 opacity-0'
                  }`}
                >
                  <div className="min-w-[200px] overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/40 dark:border-white/5 dark:bg-[#111114] dark:shadow-black/40">
                    <Link
                      to={`/category/${category.id}`}
                      className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-[#22c55e] transition-colors hover:bg-[#34d399]/5 dark:text-[#34d399] dark:hover:bg-[#34d399]/10"
                    >
                      View all {category.categoryName}
                    </Link>
                    <div className="my-1 h-px bg-gray-100 dark:bg-white/5" />
                    {(subcategories[category.id] ?? []).length > 0 ? (
                      (subcategories[category.id] ?? []).map((sub) => (
                        <Link
                          key={sub.id}
                          to={`/category/${category.id}?sub=${sub.id}`}
                          className="flex items-center rounded-xl px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-[#22c55e] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-[#34d399]"
                        >
                          {sub.categoryName}
                        </Link>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                        No subcategories
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <NavLink
              to="/about"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className={navLinkClass}
            >
              About Us
            </NavLink>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Search */}
            <div ref={searchWrapRef} className="flex items-center">
              {searchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center overflow-hidden rounded-full border border-gray-200 bg-white/80 dark:border-white/10 dark:bg-white/5"
                >
                  <Search className="ml-3 h-4 w-4 shrink-0 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    onKeyDown={handleSearchKey}
                    placeholder="Search products..."
                    aria-label="Search products"
                    className="w-40 bg-transparent px-2 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none dark:text-white sm:w-56"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false)
                      setSearchKeyword('')
                    }}
                    aria-label="Close search"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Open search"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-all duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#34d399]/0 to-[#22c55e]/0 transition-all duration-300 hover:from-[#34d399]/15 hover:to-[#22c55e]/15" />
                  <Search className="relative h-5 w-5" />
                </button>
              )}
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-all duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#34d399]/0 to-[#22c55e]/0 transition-all duration-300 hover:from-[#34d399]/15 hover:to-[#22c55e]/15" />
              {theme === 'dark' ? (
                <Sun className="relative h-5 w-5" />
              ) : (
                <Moon className="relative h-5 w-5" />
              )}
            </button>

            {/* Wishlist */}
            <button
              type="button"
              onClick={openWishlist}
              aria-label={`Open wishlist (${wishlistCount} items)`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-all duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#34d399]/0 to-[#22c55e]/0 transition-all duration-300 hover:from-[#34d399]/15 hover:to-[#22c55e]/15" />
              <Heart className="relative h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 px-1 text-[10px] font-bold text-white shadow-sm">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open cart (${itemCount} items)`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-all duration-300 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[#34d399]/0 to-[#22c55e]/0 transition-all duration-300 hover:from-[#34d399]/15 hover:to-[#22c55e]/15" />
              <ShoppingBag className="relative h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-br from-[#34d399] to-[#22c55e] px-1 text-[10px] font-bold text-white shadow-sm">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Auth */}
            <div className="relative ml-1" ref={userMenuRef}>
              {isAuthenticated && user ? (
                <>
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((prev) => !prev)}
                    aria-label="Account menu"
                    aria-haspopup="menu"
                    aria-expanded={userMenuOpen}
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#34d399] to-[#22c55e] text-sm font-bold text-white shadow-md shadow-[#22c55e]/25 transition-transform duration-200 hover:scale-105 active:scale-95"
                  >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </button>

                  <div
                    role="menu"
                    className={`absolute right-0 top-full mt-2 w-48 origin-top-right overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-gray-200/40 transition-all duration-200 dark:border-white/5 dark:bg-[#111114] dark:shadow-black/40 ${
                      userMenuOpen
                        ? 'visible scale-100 opacity-100'
                        : 'invisible scale-95 opacity-0'
                    }`}
                  >
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-400 dark:text-gray-500">
                        {user.email}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-gray-100 dark:bg-white/5" />
                    {user.role === 'ADMIN' && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setUserMenuOpen(false)
                          navigate('/dashboard')
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#22c55e] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-[#34d399]"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false)
                        navigate('/orders')
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#22c55e] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-[#34d399]"
                    >
                      <Package className="h-4 w-4" />
                      My Orders
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setUserMenuOpen(false)
                        navigate('/account')
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#22c55e] dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-[#34d399]"
                    >
                      <UserIcon className="h-4 w-4" />
                      Account
                    </button>
                    <div className="my-1 h-px bg-gray-100 dark:bg-white/5" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/sign-in"
                  className="ml-1 hidden items-center rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#22c55e]/25 transition-all duration-300 hover:shadow-lg hover:shadow-[#22c55e]/40 hover:brightness-110 sm:flex"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile menu slide-down panel */}
      <div
        ref={mobileMenuRef}
        className={`fixed inset-x-0 top-16 z-20 origin-top bg-[#6ee7b7]/95 backdrop-blur-xl transition-all duration-300 dark:bg-[#0a0a0c]/95 lg:hidden ${
          mobileOpen
            ? 'visible max-h-[calc(100vh-4rem)] translate-y-0 opacity-100 overflow-y-auto shadow-xl'
            : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <div className="space-y-1 px-4 py-4">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="block rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5"
          >
            Home
          </Link>
          {topLevel.map((category) => (
            <div key={category.id} className="space-y-0.5">
              <Link
                to={`/category/${category.id}`}
                className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5"
              >
                {category.categoryName}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Link>
              <div className="ml-4 space-y-0.5 border-l border-gray-100 pl-3 dark:border-white/5">
                {(subcategories[category.id] ?? []).map((sub) => (
                  <Link
                    key={sub.id}
                    to={`/category/${category.id}?sub=${sub.id}`}
                    className="block rounded-lg px-3 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-[#22c55e] dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-[#34d399]"
                  >
                    {sub.categoryName}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link
            to="/about"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="block rounded-xl px-4 py-2.5 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/5"
          >
            About Us
          </Link>
          {!isAuthenticated && (
            <div className="pt-2">
              <Link
                to="/sign-in"
                className="block rounded-full bg-gradient-to-r from-[#34d399] to-[#22c55e] px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-[#22c55e]/25"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
