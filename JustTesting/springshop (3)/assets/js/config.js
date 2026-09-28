/**
 * SpringShop Global Configuration
 * Centralized API Base URL and App Settings
 */
const CONFIG = {
  // Base URL for the Spring Boot backend REST API
  // In development with proxy or direct connection:
  API_BASE_URL: window.location.origin.includes('run.app') 
    ? 'http://localhost:8080' // default fallback or configurable
    : 'http://localhost:8080',
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'springshop_token',
    USER_INFO: 'springshop_user',
    OTP_PENDING_EMAIL: 'springshop_otp_pending_email',
    WISHLIST: 'springshop_wishlist',
    THEME: 'springshop_theme',
    CART_BACKUP: 'springshop_cart_local',
    SETTINGS: 'springshop_settings'
  },

  // Color Palette Reference
  COLORS: {
    PRIMARY_GREEN: '#C1E899',
    DARK_BROWN: '#9A6735',
    LIGHT_GREEN: '#E6F0DC',
    DARK_GREEN: '#55883B'
  },

  // Default Fallback Image Placeholders
  PLACEHOLDER_PRODUCT_IMAGE: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80',
  PLACEHOLDER_AVATAR: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
};

// Allow runtime override of API URL if needed (e.g. for testing custom backend URL)
const savedApiUrl = localStorage.getItem('springshop_custom_api_url');
if (savedApiUrl) {
  CONFIG.API_BASE_URL = savedApiUrl;
}

// Export to global window object
window.CONFIG = CONFIG;
