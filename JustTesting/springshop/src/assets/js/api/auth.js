/**
 * Authentication API Service
 * Maps directly to AuthController in Spring Boot
 */
import { apiClient } from './client.js';

export const authApi = {
  /**
   * POST /api/auth/register
   * @param {Object} data { name, email, password }
   */
  register(data) {
    return apiClient.post('/api/auth/register', data);
  },

  /**
   * POST /api/auth/login
   * @param {Object} data { email, password }
   */
  login(data) {
    return apiClient.post('/api/auth/login', data);
  }
};
