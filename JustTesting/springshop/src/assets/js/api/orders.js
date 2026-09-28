/**
 * Orders API Service
 * Maps directly to OrderController in Spring Boot
 */
import { apiClient } from './client.js';

export const ordersApi = {
  /**
   * POST /api/orders
   * @param {Object} data { shippingAddress }
   */
  placeOrder(data) {
    return apiClient.post('/api/orders', data);
  },

  /**
   * GET /api/orders/me
   */
  getMyOrders() {
    return apiClient.get('/api/orders/me');
  },

  /**
   * GET /api/orders/all (Admin)
   */
  getAll() {
    return apiClient.get('/api/orders/all');
  },

  /**
   * GET /api/orders/{id}
   * @param {number|string} id
   */
  getById(id) {
    return apiClient.get(`/api/orders/${id}`);
  },

  /**
   * PUT /api/orders/{id}/status?status=... (Admin)
   * @param {number|string} id
   * @param {string} status (PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
   */
  updateStatus(id, status) {
    return apiClient.put(`/api/orders/${id}/status?status=${encodeURIComponent(status)}`);
  },

  /**
   * PUT /api/orders/{id}/cancel
   * @param {number|string} id
   */
  cancelOrder(id) {
    return apiClient.put(`/api/orders/${id}/cancel`);
  }
};
