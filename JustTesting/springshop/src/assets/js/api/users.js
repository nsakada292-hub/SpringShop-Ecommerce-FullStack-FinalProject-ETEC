/**
 * Users API Service
 * Maps directly to UserController in Spring Boot
 */
import { apiClient } from './client.js';

export const usersApi = {
  /**
   * GET /api/users/me
   */
  getMyProfile() {
    return apiClient.get('/api/users/me');
  },

  /**
   * PUT /api/users/me
   * @param {Object} data { name, email }
   */
  updateMyProfile(data) {
    return apiClient.put('/api/users/me', data);
  },

  /**
   * PUT /api/users/me/password
   * @param {Object} data { currentPassword, newPassword }
   */
  changePassword(data) {
    return apiClient.put('/api/users/me/password', data);
  },

  /**
   * GET /api/users/{id}
   * @param {number|string} id
   */
  getById(id) {
    return apiClient.get(`/api/users/${id}`);
  },

  /**
   * GET /api/users (Admin)
   */
  getAll() {
    return apiClient.get('/api/users');
  }
};
