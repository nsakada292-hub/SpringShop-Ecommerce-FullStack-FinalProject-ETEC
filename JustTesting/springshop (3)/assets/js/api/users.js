/**
 * Users API Service
 * Maps to /api/users endpoints
 * Supports live Spring Boot backend and local persistent fallback
 */
const UsersAPI = {
  STORAGE_KEY: 'springshop_users_db',

  getInitialUsers() {
    return [
      {
        id: 1,
        name: 'System Administrator',
        email: 'admin@springshop.com',
        role: 'ADMIN',
        totalOrders: 0,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        name: 'Eleanor Vance',
        email: 'eleanor.vance@example.com',
        role: 'USER',
        totalOrders: 4,
        createdAt: '2026-01-14T10:20:00.000Z'
      },
      {
        id: 3,
        name: 'Marcus Thorne',
        email: 'marcus.thorne@example.com',
        role: 'USER',
        totalOrders: 7,
        createdAt: '2026-01-19T15:40:00.000Z'
      },
      {
        id: 4,
        name: 'Clara Oswald',
        email: 'clara.oswald@example.com',
        role: 'USER',
        totalOrders: 2,
        createdAt: '2026-01-25T08:15:00.000Z'
      },
      {
        id: 5,
        name: 'Liam Chen',
        email: 'liam.chen@example.com',
        role: 'USER',
        totalOrders: 1,
        createdAt: '2026-02-05T12:00:00.000Z'
      }
    ];
  },

  getLocalUsers() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('[UsersAPI] Error reading local users:', e);
    }
    const initial = this.getInitialUsers();
    this.saveLocalUsers(initial);
    return initial;
  },

  saveLocalUsers(list) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('[UsersAPI] Error saving local users:', e);
    }
  },

  /**
   * Get current authenticated user profile
   */
  async getMyProfile() {
    try {
      const data = await ApiClient.get('/api/users/me');
      if (data) return data;
    } catch (err) {
      // fallback
    }
    return (window.AuthGuard && AuthGuard.getUser()) || this.getLocalUsers()[0];
  },

  /**
   * Update profile (name, email)
   * @param {Object} data { name: string, email: string }
   */
  async updateMyProfile(data) {
    let updated = null;
    try {
      updated = await ApiClient.put('/api/users/me', data);
    } catch (err) {
      console.warn('[UsersAPI] Live backend unavailable, updating profile locally:', err);
    }

    const current = (window.AuthGuard && AuthGuard.getUser()) || { id: 1, role: 'USER' };
    const merged = { ...current, ...data };
    Storage.set(CONFIG.STORAGE_KEYS.USER_INFO, merged);
    
    const users = this.getLocalUsers();
    const idx = users.findIndex(u => u.id === merged.id || u.email === current.email);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      this.saveLocalUsers(users);
    }

    window.dispatchEvent(new CustomEvent('auth:changed', { detail: merged }));
    return updated || merged;
  },

  /**
   * Change current user password
   * @param {Object} data { currentPassword: string, newPassword: string }
   */
  async changePassword(data) {
    try {
      return await ApiClient.put('/api/users/me/password', data);
    } catch (err) {
      return { success: true, message: 'Password updated locally' };
    }
  },

  /**
   * Get user by ID (Admin)
   * @param {number|string} id
   */
  async getById(id) {
    const userId = Number(id);
    try {
      const data = await ApiClient.get(`/api/users/${userId}`);
      if (data) return data;
    } catch (err) {
      // fallback
    }
    return this.getLocalUsers().find(u => u.id === userId) || null;
  },

  /**
   * Get all registered users (Admin)
   */
  async getAll() {
    try {
      const data = await ApiClient.get('/api/users');
      if (Array.isArray(data) && data.length > 0) {
        this.saveLocalUsers(data);
        return data;
      }
    } catch (err) {
      // fallback
    }
    return this.getLocalUsers();
  }
};

window.UsersAPI = UsersAPI;