/**
 * SpringShop Configuration
 * Centralized configuration for API endpoints, storage keys, and brand defaults.
 */

// Default API Base URL: Uses the current origin /api or configurable Spring Boot backend URL (e.g., http://localhost:8080)
const DEFAULT_API_BASE_URL = window.location.origin;

export const CONFIG = {
  get API_BASE_URL() {
    return localStorage.getItem('springshop_custom_api_url') || DEFAULT_API_BASE_URL;
  },
  set API_BASE_URL(url) {
    if (url) {
      localStorage.setItem('springshop_custom_api_url', url.replace(/\/$/, ''));
    } else {
      localStorage.removeItem('springshop_custom_api_url');
    }
  },
  DEFAULT_API_BASE_URL,
  STORAGE_KEYS: {
    AUTH_TOKEN: 'springshop_jwt_token',
    AUTH_USER: 'springshop_auth_user',
    THEME: 'springshop_theme',
    WISHLIST: 'springshop_local_wishlist',
    RECENT_SEARCHES: 'springshop_recent_searches',
  },
  BRAND: {
    NAME: 'SpringShop',
    TAGLINE: 'Modern Fashion & Lifestyle Accessories',
    DEFAULT_CURRENCY: '$',
    SUPPORT_EMAIL: 'support@springshop.com',
    SUPPORT_PHONE: '+1 (800) 555-SPRG',
  },
  STATUS_COLORS: {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300',
    PROCESSING: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300',
    SHIPPED: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
    CANCELLED: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300',
  }
};
