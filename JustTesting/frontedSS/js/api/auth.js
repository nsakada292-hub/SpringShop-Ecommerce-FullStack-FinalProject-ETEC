import { ApiClient } from './client.js';
import { storage } from '../utils/storage.js';
import { CONFIG } from '../config.js';

export const authApi = {
  async login(credentials) {
    const data = await ApiClient.post('/auth/login', credentials);
    if (data.token) {
      storage.set(CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token);
      storage.set(CONFIG.STORAGE_KEYS.USER, data.user);
    }
    return data;
  },
  async register(userData) {
    const data = await ApiClient.post('/auth/register', userData);
    if (data.token) {
      storage.set(CONFIG.STORAGE_KEYS.AUTH_TOKEN, data.token);
      storage.set(CONFIG.STORAGE_KEYS.USER, data.user);
    }
    return data;
  },
  async getCurrentUser() {
    return ApiClient.get('/auth/me');
  },
  logout() {
    storage.remove(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(CONFIG.STORAGE_KEYS.USER);
  }
};