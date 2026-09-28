/**
 * Auth Guard utility for client-side route and action protection
 */
import { storage } from './storage.js';

export const authGuard = {
  isAuthenticated() {
    return !!storage.getToken();
  },

  getCurrentUser() {
    return storage.getUser();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN');
  },

  requireAuth(onUnauthenticated) {
    if (!this.isAuthenticated()) {
      if (typeof onUnauthenticated === 'function') {
        onUnauthenticated();
      }
      return false;
    }
    return true;
  },

  requireAdmin(redirectUrl = 'index.html') {
    if (!this.isAuthenticated() || !this.isAdmin()) {
      window.location.href = redirectUrl;
      return false;
    }
    return true;
  }
};
