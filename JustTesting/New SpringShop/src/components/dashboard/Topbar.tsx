import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  AlertTriangle,
  ShoppingBag,
  CheckCircle2,
  X,
  Menu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'New order #1002 placed',
      desc: 'Dara Customer placed $128.00 order with ABA KHQR',
      time: '12m ago',
      unread: true,
    },
    {
      id: 2,
      type: 'stock',
      title: 'Low stock alert',
      desc: 'Slim Fit Chino Pants has only 12 items remaining',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      type: 'review',
      title: 'New 5-star review',
      desc: 'Bopha rated Silk Blend Midi Dress 5 stars',
      time: '3h ago',
      unread: false,
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/sign-in');
  };

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors">
      {/* Mobile Toggle + Global Admin Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg"
          aria-label="Toggle mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, SKU, customer name, products..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-[#009dff] focus:bg-white dark:focus:bg-zinc-900 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none transition-all"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900"></span>
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl py-3 z-50"
              >
                <div className="px-4 pb-2 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                      Notifications
                    </h4>
                    <p className="text-[11px] text-zinc-400">2 unread activity alerts</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-3.5 flex gap-3 items-start hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                        n.unread ? 'bg-sky-50/50 dark:bg-sky-950/20' : ''
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${
                        n.type === 'order' ? 'bg-[#00e1ff]/15 text-[#009dff]' :
                        n.type === 'stock' ? 'bg-amber-500/15 text-amber-500' :
                        'bg-[#4ce600]/15 text-[#00e000]'
                      }`}>
                        {n.type === 'order' && <ShoppingBag className="w-4 h-4" />}
                        {n.type === 'stock' && <AlertTriangle className="w-4 h-4" />}
                        {n.type === 'review' && <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{n.title}</p>
                          <span className="text-[10px] text-zinc-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight">{n.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dark/Light mode toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-300 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Current staff member info + Sign Out */}
        <div className="flex items-center gap-3 pl-2 border-l border-zinc-200 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{user?.name || 'Staff Admin'}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#00e1ff]/15 text-[#009dff] uppercase tracking-wider">
                {user?.role || 'ADMIN'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="p-2 text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ml-1"
            title="Sign out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
