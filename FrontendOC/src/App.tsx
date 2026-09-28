import type { ReactNode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/shared/contexts/AuthContext'

/* StoreFront routes */
import StoreLayout from '@/storeFront/components/layout/MainLayout'
import HomePage from '@/storeFront/pages/HomePage'
import CategoryPage from '@/storeFront/pages/CategoryPage'
import ProductDetailPage from '@/storeFront/pages/ProductDetailPage'
import CartPage from '@/storeFront/pages/CartPage'
import WishlistPage from '@/storeFront/pages/WishlistPage'
import SignInPage from '@/storeFront/pages/auth/SignInPage'
import VerifyEmailPage from '@/storeFront/pages/auth/VerifyEmailPage'
import ForgotPasswordPage from '@/storeFront/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/storeFront/pages/auth/ResetPasswordPage'
import CheckoutPage from '@/storeFront/pages/CheckoutPage'
import PaymentPage from '@/storeFront/pages/PaymentPage'
import OrdersPage from '@/storeFront/pages/OrdersPage'
import OrderDetailPage from '@/storeFront/pages/OrderDetailPage'
import CategoryBrowsePage from '@/storeFront/pages/CategoryBrowsePage'
import { default as StoreAccountPage } from '@/storeFront/pages/AccountPage'
import AboutUsPage from '@/storeFront/pages/AboutUsPage'
import NotFoundPage from '@/storeFront/pages/NotFoundPage'

/* Dashboard routes */
import DashboardLayout from '@/frontend-dashboard/components/layout/DashboardLayout'
import DashboardPage from '@/frontend-dashboard/pages/DashboardPage'
import ProductPage from '@/frontend-dashboard/pages/ProductPage'
import DashboardCategoryPage from '@/frontend-dashboard/pages/CategoryPage'
import OrderPage from '@/frontend-dashboard/pages/OrderPage'
import ReviewPage from '@/frontend-dashboard/pages/ReviewPage'
import CustomerPage from '@/frontend-dashboard/pages/CustomerPage'
import SettingsPage from '@/frontend-dashboard/pages/SettingsPage'
import AccountPage from '@/frontend-dashboard/pages/AccountPage'

function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/sign-in" replace />
  }
  return children
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />
  }
  return children
}

export default function App() {
  return (
    <>
      <Routes>
      {/* StoreFront */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
        <Route path="/category" element={<CategoryBrowsePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/payment/:orderId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><StoreAccountPage /></ProtectedRoute>} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* Auth pages (no layout) */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<ProtectedAdminRoute><DashboardLayout /></ProtectedAdminRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductPage />} />
        <Route path="categories" element={<DashboardCategoryPage />} />
        <Route path="orders" element={<OrderPage />} />
        <Route path="reviews" element={<ReviewPage />} />
        <Route path="customers" element={<CustomerPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="account" element={<AccountPage />} />
      </Route>
    </Routes>
    </>
  )
}
