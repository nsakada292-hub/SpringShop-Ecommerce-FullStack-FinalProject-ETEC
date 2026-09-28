import { ApiClient } from './client.js';

export const usersApi = {
  getAll() {
    return ApiClient.get('/users');
  },
  getById(id) {
    return ApiClient.get(`/users/${id}`);
  },
  update(id, data) {
    return ApiClient.put(`/users/${id}`, data);
  }
};