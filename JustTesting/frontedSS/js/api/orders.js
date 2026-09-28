import { ApiClient } from './client.js';

export const ordersApi = {
  getAll(params = {}) {
    return ApiClient.get('/orders', params);
  },
  getMyOrders() {
    return ApiClient.get('/orders/my');
  },
  getById(id) {
    return ApiClient.get(`/orders/${id}`);
  },
  create(orderData) {
    return ApiClient.post('/orders', orderData);
  },
  updateStatus(id, status) {
    return ApiClient.put(`/orders/${id}/status`, { status });
  }
};