import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar/Navbar';
import { Footer } from '../components/layout/Footer/Footer';
import { CartDrawer } from '../components/layout/Drawers/CartDrawer';
import { WishlistDrawer } from '../components/layout/Drawers/WishlistDrawer';
import { ModeSwitchBanner } from '../components/layout/ModeSwitchBanner';
import { motion } from 'motion/react';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <ModeSwitchBanner />
      <Navbar />
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>
      <Footer />
      <CartDrawer />
      <WishlistDrawer />
    </div>
  );
};
