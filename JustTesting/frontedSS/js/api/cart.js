import { ApiClient } from './client.js';
import { storage } from '../utils/storage.js';
import { CONFIG } from '../config.js';
import { authGuard } from '../utils/auth-guard.js';

export const cartApi = {
  async getCart() {
    if (authGuard.isAuthenticated()) {
      try {
        return await ApiClient.get('/cart');
      } catch (e) {
        return storage.get(CONFIG.STORAGE_KEYS.CART, []);
      }
    }
    return storage.get(CONFIG.STORAGE_KEYS.CART, []);
  },
  async syncCart(items) {
    storage.set(CONFIG.STORAGE_KEYS.CART, items);
    if (authGuard.isAuthenticated()) {
      try {
        return await ApiClient.post('/cart/sync', { items });
      } catch (e) {
        console.warn('Could not sync cart to backend');
      }
    }
    return items;
  }
};