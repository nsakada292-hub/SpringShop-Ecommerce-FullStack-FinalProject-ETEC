/**
 * Local Storage Helper Utilities
 */
import { CONFIG } from '../config.js';

export const storage = {
  getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },
  setToken(token) {
    if (token) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    }
  },
  getUser() {
    const raw = localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user) {
    if (user) {
      localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_USER);
    }
  },
  clearAuth() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_USER);
  },
  getTheme() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
  },
  setTheme(theme) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
  },
  getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.WISHLIST) || '[]');
    } catch {
      return [];
    }
  },
  setWishlist(items) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.WISHLIST, JSON.stringify(items));
  },
  toggleWishlist(productId) {
    const list = this.getWishlist();
    const index = list.indexOf(productId);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(productId);
    }
    this.setWishlist(list);
    return list;
  },
  isWishlisted(productId) {
    const list = this.getWishlist();
    return list.includes(productId);
  }
};
