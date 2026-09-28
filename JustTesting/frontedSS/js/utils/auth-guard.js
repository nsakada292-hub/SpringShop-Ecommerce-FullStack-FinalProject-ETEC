import { storage } from './storage.js';
import { CONFIG } from '../config.js';

export const authGuard = {
  isAuthenticated() {
    return !!storage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },
  getUser() {
    return storage.get(CONFIG.STORAGE_KEYS.USER, null);
  },
  isAdmin() {
    const user = this.getUser();
    return user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN' || user.isAdmin === true);
  },
  requireAdmin(redirectUrl = '/index.html') {
    if (!this.isAdmin()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  },
  requireAuth(redirectUrl = '/index.html') {
    if (!this.isAuthenticated()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }
};