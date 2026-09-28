/**
 * Centralized Fetch API Client for SpringShop
 * Fully compliant with Spring Boot REST conventions
 */
import { CONFIG } from '../config.js';
import { storage } from '../utils/storage.js';

class ApiClient {
  getBaseUrl() {
    return CONFIG.API_BASE_URL;
  }

  getHeaders(isMultipart = false) {
    const headers = {};
    const token = storage.getToken();

    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.getBaseUrl()}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const isMultipart = options.body instanceof FormData;

    const config = {
      method: options.method || 'GET',
      headers: {
        ...this.getHeaders(isMultipart),
        ...(options.headers || {}),
      },
      ...options,
    };

    if (config.body && !isMultipart && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Handle 401 Unauthorized -> clear token
      if (response.status === 401) {
        storage.clearAuth();
        window.dispatchEvent(new CustomEvent('springshop:auth-expired'));
      }

      // Parse JSON if possible
      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = text;
          }
        }
      }

      if (!response.ok) {
        const error = new Error(
          (data && (data.message || data.error)) ||
          `HTTP ${response.status}: ${response.statusText}`
        );
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Re-throw formatted error
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
