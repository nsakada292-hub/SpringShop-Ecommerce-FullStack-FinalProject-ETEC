import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/Home/HomePage";
import CategoryListingPage from "../pages/CategoryListing/CategoryListingPage";
import ProductDetailPage from "../pages/ProductDetail/ProductDetailPage";
import SignInPage from "../pages/Auth/SignIn/SignInPage";
import RegisterPage from "../pages/Auth/Register/RegisterPage";
import VerifyOtpPage from "../pages/Auth/VerifyOtp/VerifyOtpPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPassword/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Auth/ResetPassword/ResetPasswordPage";
import CartPage from "../pages/Cart/CartPage";
import WishlistPage from "../pages/Wishlist/WishlistPage";
import SearchPage from "../pages/Search/SearchPage";
import CheckoutPage from "../pages/Checkout/CheckoutPage";
import AccountPage from "../pages/Account/AccountPage";
import OrdersPage from "../pages/Orders/OrdersPage";
import NotFoundPage from "../pages/NotFound/NotFoundPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/category/:type" element={<CategoryListingPage />} />
        <Route path="/category/:type/:subcategory" element={<CategoryListingPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/orders" element={<OrdersPage />} />

        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
