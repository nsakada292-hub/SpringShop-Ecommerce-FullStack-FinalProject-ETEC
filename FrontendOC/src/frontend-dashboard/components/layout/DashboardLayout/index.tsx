import { useState, useMemo, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/shared/utils/cn'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { useAuth } from '@/shared/contexts/AuthContext'
import { getInitials } from '@/shared/utils/cn'
import NotificationBell from '@/frontend-dashboard/components/layout/NotificationBell'
import toast from 'react-hot-toast'
import springShopLogo from '@/assets/spring-shop-logo.png'
import BackgroundSwirl from '@/shared/components/BackgroundSwirl'

interface NavItem {
  label: string
  to: string
  icon: ReactNode
}

const mainNav: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Products', to: '/dashboard/products', icon: <Package size={20} /> },
  { label: 'Categories', to: '/dashboard/categories', icon: <FolderTree size={20} /> },
  { label: 'Orders', to: '/dashboard/orders', icon: <ShoppingCart size={20} /> },
]

const manageNav: NavItem[] = [
  { label: 'Customers', to: '/dashboard/customers', icon: <Users size={20} /> },
  { label: 'Settings', to: '/dashboard/settings', icon: <Settings size={20} /> },
]

const accountNav: NavItem[] = [
  { label: 'My Account', to: '/dashboard/account', icon: <User size={20} /> },
]

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/products': 'Products',
  '/dashboard/categories': 'Categories',
  '/dashboard/orders': 'Orders',
  '/dashboard/reviews': 'Reviews',
  '/dashboard/customers': 'Customers',
  '/dashboard/settings': 'Settings',
  '/dashboard/account': 'My Account',
}

function SidebarLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
          isActive
            ? 'bg-gradient-primary text-white shadow-lg shadow-brand-aqua/20'
            : 'text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-white/5'
        )
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </NavLink>
  )
}

function NavSection({ label, items, onClick }: { label: string; items: NavItem[]; onClick?: () => void }) {
  return (
    <div className="mb-4">
      <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => (
          <SidebarLink key={item.to} item={item} onClick={onClick} />
        ))}
      </div>
    </div>
  )
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    toast.success('Signed out')
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-surface-200 dark:border-surface-800">
        <img
          src={springShopLogo}
          alt="SpringShop logo"
          className="h-9 w-auto shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-bold text-surface-900 dark:text-white truncate">SpringShop</p>
          <p className="text-[11px] text-surface-500 dark:text-surface-400">Admin Panel</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <NavSection label="Main" items={mainNav} onClick={onClose} />
        <NavSection label="Manage" items={manageNav} onClick={onClose} />
        <NavSection label="Account" items={accountNav} onClick={onClose} />
      </nav>

      <div className="px-3 pb-3 space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-white/5 transition-all"
        >
          <ExternalLink size={20} />
          <span>View Store</span>
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-500/10 transition-all"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

function Topbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const location = useLocation()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const pageTitle = useMemo(() => {
    const base = '/' + (location.pathname.split('/').filter(Boolean)[0] ?? '')
    const full = location.pathname
    if (routeTitleMap[full]) return routeTitleMap[full]
    if (routeTitleMap[base]) return routeTitleMap[base]
    return 'Dashboard'
  }, [location.pathname])

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    toast.success('Signed out')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-4 px-4 md:px-6 py-3 bg-white/80 backdrop-blur-xl border-b border-surface-200 dark:bg-surface-950/80 dark:border-surface-800">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 lg:hidden"
      >
        <Menu size={20} />
      </button>

      <h1 className="text-lg font-bold text-surface-900 dark:text-white hidden sm:block">{pageTitle}</h1>

      <div className="flex-1 max-w-xs ml-auto hidden md:block">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-surface-100 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-500 dark:placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-aqua/30 focus:border-brand-aqua transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-surface-500 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <NotificationBell />

        <div className="relative ml-1">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 overflow-hidden rounded-lg bg-gradient-primary text-white text-xs font-bold">
              {user?.avatarUrl ? (
                <img src={user?.avatarUrl} alt={user.name ?? 'User'} className="h-full w-full object-cover" />
              ) : (
                user ? getInitials(user.name) : 'AD'
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-surface-900 dark:text-white leading-tight">{user?.name ?? 'Admin'}</p>
              <p className="text-[11px] text-surface-500 dark:text-surface-400 leading-tight">{user?.role ?? 'ADMIN'}</p>
            </div>
          </button>

          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-2xl z-50 py-1 animate-slide-up">
                <Link
                  to="/dashboard/account"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-surface-700 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-300 dark:hover:text-white dark:hover:bg-surface-700 transition-colors"
                >
                  <User size={16} />
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default function DashboardLayout({ children }: { children?: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-surface-950">
      <BackgroundSwirl />
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="fixed inset-y-0 left-0 z-50 w-[260px] hidden lg:block">
          <Sidebar />
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[280px] animate-slide-in-left">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        <div className="lg:ml-[260px] min-h-screen flex flex-col">
          <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 p-4 md:p-6">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </div>
  )
}
