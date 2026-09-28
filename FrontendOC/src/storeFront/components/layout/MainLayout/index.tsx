import { Outlet } from 'react-router-dom'
import Navbar from '@/storeFront/components/layout/Navbar'
import Footer from '@/storeFront/components/layout/Footer'
import CartDrawer from '@/storeFront/components/cart/CartDrawer'
import WishlistDrawer from '@/storeFront/components/wishlist/WishlistDrawer'
import { DrawerProvider } from '@/shared/contexts/DrawerContext'
import BackgroundSwirl from '@/shared/components/BackgroundSwirl'

export default function MainLayout() {
  return (
    <DrawerProvider>
      <div className="min-h-screen flex flex-col bg-white dark:bg-[#0a0a0c]">
        <BackgroundSwirl />
        <div className="relative z-10 flex min-h-screen flex-1 flex-col">
          <Navbar />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
          <CartDrawer />
          <WishlistDrawer />
        </div>
      </div>
    </DrawerProvider>
  )
}
