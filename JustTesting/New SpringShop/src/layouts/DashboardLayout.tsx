import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar';
import { Topbar } from '../components/dashboard/Topbar';
import { ModeSwitchBanner } from '../components/layout/ModeSwitchBanner';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If user is not admin, redirect to sign-in or give them customer view
  if (!isAuthenticated) {
    return <Navigate to="/sign-in?redirect=/admin/dashboard" replace />;
  }

  // Note: if user is logged in as USER, they can click "Admin Staff" in sign in or ModeSwitchBanner to switch to ADMIN
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 text-center">
        <div className="max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            Staff Privileges Required
          </h2>
          <p className="text-xs text-zinc-500 mb-6">
            You are currently signed in as a customer ({user?.email}). Switch to the administrator account (Sophea) to access the dashboard.
          </p>
          <a
            href="/sign-in"
            className="btn-primary-gradient px-4 py-2.5 rounded-xl text-xs font-semibold inline-block"
          >
            Switch to Admin Demo Account
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      <ModeSwitchBanner />

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(!collapsed)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-64 max-w-xs bg-zinc-950 flex flex-col z-10 shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
                <Sidebar
                  collapsed={false}
                  onToggleCollapse={() => setIsMobileMenuOpen(false)}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            collapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          <Topbar onMobileMenuToggle={() => setIsMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};
