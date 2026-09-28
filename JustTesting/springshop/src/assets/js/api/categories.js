/**
 * Category API Service
 * Maps directly to CategoryController in Spring Boot
 */
import { apiClient } from './client.js';

export const categoriesApi = {
  /**
   * GET /api/categories
   */
  getAll() {
    return apiClient.get('/api/categories');
  },

  /**
   * GET /api/categories/top-level
   */
  getTopLevel() {
    return apiClient.get('/api/categories/top-level');
  },

  /**
   * GET /api/categories/{id}/subcategories
   */
  getSubCategories(id) {
    return apiClient.get(`/api/categories/${id}/subcategories`);
  },

  /**
   * GET /api/categories/{id}
   */
  getById(id) {
    return apiClient.get(`/api/categories/${id}`);
  },

  /**
   * POST /api/categories
   * @param {Object} data { categoryName, parentCategoryId, description }
   */
  create(data) {
    return apiClient.post('/api/categories', data);
  },

  /**
   * PUT /api/categories/{id}
   * @param {number|string} id
   * @param {Object} data { categoryName, parentCategoryId, description }
   */
  update(id, data) {
    return apiClient.put(`/api/categories/${id}`, data);
  },

  /**
   * DELETE /api/categories/{id}
   */
  delete(id) {
    return apiClient.delete(`/api/categories/${id}`);
  }
};
