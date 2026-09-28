import { ApiClient } from './client.js';

export const productsApi = {
  getAll(params = {}) {
    return ApiClient.get('/products', params);
  },
  getById(id) {
    return ApiClient.get(`/products/${id}`);
  },
  create(productData) {
    return ApiClient.post('/products', productData);
  },
  update(id, productData) {
    return ApiClient.put(`/products/${id}`, productData);
  },
  delete(id) {
    return ApiClient.delete(`/products/${id}`);
  },
  uploadImage(id, formData) {
    return ApiClient.post(`/products/${id}/image`, formData);
  }
};