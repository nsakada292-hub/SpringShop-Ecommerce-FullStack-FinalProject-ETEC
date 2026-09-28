/**
 * Centralized Fetch API Client
 * Handles HTTP requests, JWT injection, response parsing, and error status handling
 */
const ApiClient = {
  /**
   * Get Authorization header with Bearer token if present
   */
  getAuthHeaders() {
    const token = Storage.get(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  /**
   * Core request wrapper
   */
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    
    const headers = {
      ...this.getAuthHeaders(),
      ...(options.headers || {})
    };

    // If body is NOT FormData, set application/json
    const isFormData = options.body instanceof FormData;
    if (!isFormData && options.body && typeof options.body === 'object') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const { method, headers: _h, body: _b, timeout: _t, ...restOptions } = options;
    const config = {
      method: method || 'GET',
      headers,
      body: _b,
      ...restOptions
    };

    // Apply optional timeout (default: 30s)
    const timeoutMs = options.timeout || 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Parse JSON if possible, fallback to text
      let data = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          data = null;
        }
      } else {
        const text = await response.text();
        data = text ? { message: text } : null;
      }

      // Handle error status codes
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          console.warn('[ApiClient] 401 Unauthorized detected. Clearing invalid auth state.');
          Storage.remove(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
          Storage.remove(CONFIG.STORAGE_KEYS.USER_INFO);
          window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
        }

        const errorObj = {
          status: response.status,
          statusText: response.statusText,
          message: data?.message || data?.error || (typeof data === 'string' ? data : `Request failed with status ${response.status}`),
          data: data
        };
        throw errorObj;
      }

      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw { status: 0, message: 'Request timed out. The server may be unreachable.' };
      }
      if (err.status) {
        throw err;
      }
      // Network failure / server unreachable
      throw {
        status: 0,
        message: err.message || 'Unable to connect to server. Please check that Spring Boot is running on ' + CONFIG.API_BASE_URL
      };
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
};

window.ApiClient = ApiClient;
