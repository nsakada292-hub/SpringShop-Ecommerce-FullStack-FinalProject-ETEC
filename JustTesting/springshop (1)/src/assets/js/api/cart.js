/**
 * Cart API Service
 * Maps directly to CartController in Spring Boot
 */
import { apiClient } from './client.js';

export const cartApi = {
  /**
   * GET /api/cart
   */
  getMyCart() {
    return apiClient.get('/api/cart');
  },

  /**
   * POST /api/cart/items
   * @param {Object} data { productId, quantity }
   */
  addItem(data) {
    return apiClient.post('/api/cart/items', data);
  },

  /**
   * PUT /api/cart/items/{cartItemId}?quantity=...
   * @param {number|string} cartItemId
   * @param {number} quantity
   */
  updateItemQuantity(cartItemId, quantity) {
    return apiClient.put(`/api/cart/items/${cartItemId}?quantity=${quantity}`);
  },

  /**
   * DELETE /api/cart/items/{cartItemId}
   * @param {number|string} cartItemId
   */
  removeItem(cartItemId) {
    return apiClient.delete(`/api/cart/items/${cartItemId}`);
  },

  /**
   * DELETE /api/cart
   */
  clearMyCart() {
    return apiClient.delete('/api/cart');
  }
};
