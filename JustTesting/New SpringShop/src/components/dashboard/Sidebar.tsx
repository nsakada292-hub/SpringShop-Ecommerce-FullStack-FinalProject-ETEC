import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingBag,
  Users,
  Star,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Store,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const navItems = [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', to: '/admin/products', icon: Package },
    { label: 'Categories', to: '/admin/categories', icon: FolderTree },
    { label: 'Orders', to: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', to: '/admin/customers', icon: Users },
    { label: 'Reviews', to: '/admin/reviews', icon: Star },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 z-30 bg-zinc-950 border-r border-zinc-800 text-zinc-300 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800/80 shrink-0">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center text-white font-black text-base shrink-0 shadow-sm">
            S
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-base tracking-tight text-white">
                Spring<span className="text-[#00e1ff]">Admin</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#4ce600] font-bold mt-0.5">
                Staff Console
              </span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800/80 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'btn-primary-gradient shadow-md font-bold text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                } ${collapsed ? 'justify-center px-0' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* App Switcher out to StoreFront */}
      <div className="p-3 border-t border-zinc-800/80 shrink-0">
        <Link
          to="/"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Back to Customer StoreFront"
        >
          <Store className="w-4 h-4 text-[#00e1ff] shrink-0" />
          {!collapsed && (
            <div className="flex-1 flex items-center justify-between">
              <span>View StoreFront</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
};
