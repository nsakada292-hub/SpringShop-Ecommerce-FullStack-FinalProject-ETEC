import { ApiClient } from './client.js';

export const categoriesApi = {
  getAll() {
    return ApiClient.get('/categories');
  },
  getById(id) {
    return ApiClient.get(`/categories/${id}`);
  },
  create(data) {
    return ApiClient.post('/categories', data);
  },
  update(id, data) {
    return ApiClient.put(`/categories/${id}`, data);
  },
  delete(id) {
    return ApiClient.delete(`/categories/${id}`);
  }
};