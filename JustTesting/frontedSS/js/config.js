export const CONFIG = {
  APP_NAME: 'SpringShop',
  VERSION: '1.0.0',
  DEFAULT_API_BASE: '/api',
  STORAGE_KEYS: {
    AUTH_TOKEN: 'springshop_jwt_token',
    USER: 'springshop_user_data',
    CART: 'springshop_cart_items',
    WISHLIST: 'springshop_wishlist_items',
    THEME: 'springshop_theme',
    CUSTOM_API_URL: 'springshop_custom_api_url',
    ACTIVE_CATEGORY: 'springshop_active_category'
  },
  THEME_COLORS: {
    PRIMARY_GREEN: '#C1E899',
    DARK_BROWN: '#9A6735',
    LIGHT_GREEN: '#E6F0DC',
    DARK_GREEN: '#55883B'
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 12,
    ADMIN_LIMIT: 10
  }
};

export const getApiBaseUrl = () => {
  return localStorage.getItem(CONFIG.STORAGE_KEYS.CUSTOM_API_URL) || CONFIG.DEFAULT_API_BASE;
};

export const setApiBaseUrl = (url) => {
  if (url) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CUSTOM_API_URL, url.replace(/\/$/, ''));
  } else {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.CUSTOM_API_URL);
  }
};