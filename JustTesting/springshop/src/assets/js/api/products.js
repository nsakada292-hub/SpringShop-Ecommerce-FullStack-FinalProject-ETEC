/**
 * Product API Service
 * Maps directly to ProductController in Spring Boot
 */
import { apiClient } from './client.js';

export const productsApi = {
  /**
   * GET /api/products
   */
  getAll() {
    return apiClient.get('/api/products');
  },

  /**
   * GET /api/products/{id}
   * @param {number|string} id
   */
  getById(id) {
    return apiClient.get(`/api/products/${id}`);
  },

  /**
   * GET /api/products/category/{categoryId}
   * @param {number|string} categoryId
   */
  getByCategory(categoryId) {
    return apiClient.get(`/api/products/category/${categoryId}`);
  },

  /**
   * GET /api/products/search?keyword=...
   * @param {string} keyword
   */
  search(keyword) {
    return apiClient.get(`/api/products/search?keyword=${encodeURIComponent(keyword || '')}`);
  },

  /**
   * POST /api/products (multipart/form-data)
   * @param {FormData} formData
   */
  create(formData) {
    return apiClient.post('/api/products', formData);
  },

  /**
   * PUT /api/products/{id} (multipart/form-data)
   * @param {number|string} id
   * @param {FormData} formData
   */
  update(id, formData) {
    return apiClient.put(`/api/products/${id}`, formData);
  },

  /**
   * DELETE /api/products/{id}
   * @param {number|string} id
   */
  delete(id) {
    return apiClient.delete(`/api/products/${id}`);
  }
};
