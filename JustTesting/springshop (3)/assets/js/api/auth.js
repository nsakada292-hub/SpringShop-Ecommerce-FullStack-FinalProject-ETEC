/**
 * Authentication API Service
 * Maps to com.example.SpringShop_Backend.controller.AuthController
 *
 * NOTE: The backend uses an OTP-verified flow:
 *   POST /api/auth/register    -> OtpResponse { message }   (NO token yet)
 *   POST /api/auth/login       -> OtpResponse { message }   (NO token yet)
 *   POST /api/auth/send-otp    -> OtpResponse { message }   (resend code)
 *   POST /api/auth/verify-otp  -> AuthResponse { token, refreshToken, user }
 *
 * So login()/register() no longer return a token. They return the "OTP
 * required" state; the caller must then collect the code the user received
 * and call verifyOtp() to actually start the session.
 */
const AuthAPI = {

  /**
   * Register a new user
   * POST /api/auth/register
   * @param {{ name: string, email: string, password: string }} data
   * @returns {Promise<{ message: string, otpRequired: true, email: string }>}
   */
  async register(data) {
    const res = await ApiClient.post('/api/auth/register', data);
    return this._otpPending(res, data.email);
  },

  /**
   * Login user
   * POST /api/auth/login
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ message: string, otpRequired: true, email: string }>}
   */
  async login(credentials) {
    const res = await ApiClient.post('/api/auth/login', credentials);
    return this._otpPending(res, credentials.email);
  },

  /**
   * Resend an OTP code
   * POST /api/auth/send-otp
   * @param {string} email
   * @returns {Promise<{ message: string, otpRequired: true, email: string }>}
   */
  async sendOtp(email) {
    const res = await ApiClient.post('/api/auth/send-otp', { email });
    return this._otpPending(res, email);
  },

  /**
   * Complete the session by verifying the emailed code.
   * POST /api/auth/verify-otp
   * @param {string} email
   * @param {string} otpCode
   * @returns {Promise<{ token: string, refreshToken: string, user: { id, name, email, role } }>}
   */
  async verifyOtp(email, otpCode) {
    const res = await ApiClient.post('/api/auth/verify-otp', { email, otpCode });
    if (res && res.token) {
      this.setSession(res.token, res.user);
      this.clearPendingOtp();
    }
    return res;
  },

  /**
   * Mark that an OTP is required for the given email so the UI can show the
   * verification step (and so any code-splitting page can resume it).
   */
  _otpPending(res, email) {
    if (email) {
      Storage.set(CONFIG.STORAGE_KEYS.OTP_PENDING_EMAIL, email);
    }
    return { ...(res || {}), otpRequired: true, email };
  },

  getPendingOtpEmail() {
    return Storage.get(CONFIG.STORAGE_KEYS.OTP_PENDING_EMAIL, null);
  },

  clearPendingOtp() {
    Storage.remove(CONFIG.STORAGE_KEYS.OTP_PENDING_EMAIL);
  },

  setSession(token, user) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_INFO, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: user }));
  },

  logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_INFO);
    Storage.remove(CONFIG.STORAGE_KEYS.OTP_PENDING_EMAIL);
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
  }
};

window.AuthAPI = AuthAPI;
