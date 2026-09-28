import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Store, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ModeSwitchBanner: React.FC = () => {
  const location = useLocation();
  const { user, setUser } = useAuth();
  const isAdminPath = location.pathname.startsWith('/admin');

  const switchDemoRole = () => {
    if (isAdminPath) {
      // Switched to customer
      setUser({
        id: 2,
        name: 'Dara Customer',
        email: 'customer@springshop.com',
        role: 'USER',
        createdAt: '2026-01-15T00:00:00'
      });
    } else {
      // Switched to admin
      setUser({
        id: 1,
        name: 'Sophea Admin',
        email: 'admin@springshop.com',
        role: 'ADMIN',
        createdAt: '2026-01-01T00:00:00'
      });
    }
  };

  return (
    <div className="bg-zinc-900 text-zinc-300 text-[11px] py-1.5 px-4 border-b border-zinc-800 flex items-center justify-between z-50">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#00e000] animate-pulse"></span>
            SpringShop API Live
          </span>
          <span className="text-zinc-500 hidden sm:inline">•</span>
          <span className="text-zinc-400 hidden sm:inline">
            Active App: <strong className="text-white">{isAdminPath ? 'frontend-dashboard' : 'storeFront'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isAdminPath ? (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-0.5 rounded-full transition-colors"
            >
              <Store className="w-3 h-3 text-[#00e1ff]" />
              <span>Switch to StoreFront</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          ) : (
            <Link
              to="/admin/dashboard"
              onClick={switchDemoRole}
              className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-0.5 rounded-full transition-colors"
            >
              <ShieldCheck className="w-3 h-3 text-[#4ce600]" />
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
