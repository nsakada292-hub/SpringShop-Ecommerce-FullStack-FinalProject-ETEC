/**
 * Reviews API Service
 * Maps directly to ReviewController in Spring Boot
 */
import { apiClient } from './client.js';

export const reviewsApi = {
  /**
   * GET /api/reviews/product/{productId}
   * @param {number|string} productId
   */
  getByProduct(productId) {
    return apiClient.get(`/api/reviews/product/${productId}`);
  },

  /**
   * GET /api/reviews/product/{productId}/average
   * @param {number|string} productId
   */
  getAverageRating(productId) {
    return apiClient.get(`/api/reviews/product/${productId}/average`);
  },

  /**
   * POST /api/reviews
   * @param {Object} data { productId, rating, comment }
   */
  create(data) {
    return apiClient.post('/api/reviews', data);
  },

  /**
   * PUT /api/reviews/{id}
   * @param {number|string} id
   * @param {Object} data { rating, comment }
   */
  update(id, data) {
    return apiClient.put(`/api/reviews/${id}`, data);
  },

  /**
   * DELETE /api/reviews/{id}
   * @param {number|string} id
   */
  delete(id) {
    return apiClient.delete(`/api/reviews/${id}`);
  }
};
