/**
 * Auth Guard Utility
 * Checks login status and roles for navigation and UI protection
 */
const AuthGuard = {
  getToken() {
    return localStorage.getItem((window.CONFIG && window.CONFIG.STORAGE_KEYS && window.CONFIG.STORAGE_KEYS.AUTH_TOKEN) || 'springshop_token');
  },

  getUser() {
    try {
      const user = localStorage.getItem((window.CONFIG && window.CONFIG.STORAGE_KEYS && window.CONFIG.STORAGE_KEYS.USER_INFO) || 'springshop_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  isAdmin() {
    const user = this.getUser();
    return !!(user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN'));
  },

  /**
   * Enforce customer authentication; opens login modal or redirects
   */
  requireAuth(onSuccess) {
    if (this.isAuthenticated()) {
      if (typeof onSuccess === 'function') onSuccess();
      return true;
    }
    if (window.Modal) {
      window.Modal.open('auth-modal');
      if (window.Toast) window.Toast.info('Please sign in to proceed.');
    }
    return false;
  },

  /**
   * Enforce admin authentication on admin.html
   */
  requireAdmin(redirectUrl = 'index.html') {
    return this.requireAdminPage(redirectUrl);
  },

  /**
   * Enforce admin authentication on admin.html
   */
  requireAdminPage(redirectUrl = 'index.html') {
    if (!this.isAuthenticated() || !this.isAdmin()) {
      const user = this.getUser();
      const isNotAdmin = this.isAuthenticated() && !this.isAdmin();

      const sidebarContainer = document.getElementById('adminSidebarContainer');
      const topbarContainer = document.getElementById('adminTopbarContainer');
      const mainContent = document.getElementById('adminMainContent');

      if (sidebarContainer) sidebarContainer.innerHTML = '';
      if (topbarContainer) topbarContainer.innerHTML = '';

      const portalHtml = `
        <div class="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
          <div class="max-w-md w-full bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 text-center animate-fade-in">
            <div class="w-14 h-14 bg-[#E6F0DC] text-[#55883B] dark:bg-[#1a2a16] dark:text-[#79bf54] rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            
            <h1 class="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Admin Portal
            </h1>
            <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
              ${isNotAdmin 
                ? `Account (${user?.email || 'User'}) lacks Administrator rights (Role: ${user?.role || 'USER'}).` 
                : 'Sign in with administrator credentials or use instant demo access.'}
            </p>

            ${isNotAdmin ? `
              <div class="space-y-3">
                <p class="text-xs text-rose-500 font-semibold">This account does not have Admin privileges.</p>
                <div class="flex gap-3 justify-center pt-2">
                  <a href="index.html" class="flex-1 btn-outline py-2 text-xs font-semibold justify-center">
                    <i class="fa-solid fa-store mr-1.5"></i> Storefront
                  </a>
                  <button type="button" onclick="AuthAPI.logout(); window.location.reload();" class="flex-1 btn-outline py-2 text-xs font-semibold justify-center text-rose-500 hover:text-rose-600 cursor-pointer">
                    Sign Out
                  </button>
                </div>
              </div>
            ` : `
              <form id="adminDirectLoginForm" onsubmit="AuthGuard.handleAdminLogin(event)" class="space-y-4 text-left">
                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Admin Email</label>
                  <input 
                    type="email" 
                    id="adminLoginEmail" 
                    required 
                    autocomplete="username"
                    placeholder="you@example.com"
                    class="form-input text-xs w-full py-2 px-3 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input 
                    type="password" 
                    id="adminLoginPassword" 
                    required 
                    autocomplete="current-password"
                    placeholder="Enter your password"
                    class="form-input text-xs w-full py-2 px-3 rounded-lg border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div id="adminLoginError" class="hidden text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-lg"></div>

                <button type="submit" id="adminSubmitBtn" class="w-full btn-primary py-2.5 text-xs font-bold justify-center cursor-pointer">
                  <i class="fa-solid fa-right-to-bracket mr-1.5"></i> Sign In to Dashboard
                </button>
              </form>

              <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                <a href="index.html" class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white font-medium inline-flex items-center gap-1.5">
                  <i class="fa-solid fa-arrow-left text-[10px]"></i> Back to Customer Storefront
                </a>
              </div>
            `}
          </div>
        </div>
      `;

      if (mainContent) {
        mainContent.innerHTML = portalHtml;
      } else {
        document.body.innerHTML = portalHtml;
      }
      return false;
    }
    return true;
  },

  /**
   * Handle admin login form submission
   */
  async handleAdminLogin(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const email = document.getElementById('adminLoginEmail')?.value?.trim();
    const password = document.getElementById('adminLoginPassword')?.value;
    const errEl = document.getElementById('adminLoginError');
    const submitBtn = document.getElementById('adminSubmitBtn');

    if (!email || !password) {
      if (errEl) {
        errEl.textContent = 'Please enter both email and password.';
        errEl.classList.remove('hidden');
      }
      return;
    }

    if (errEl) errEl.classList.add('hidden');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-1.5"></i> Authenticating...';
    }

    try {
      if (window.AuthAPI && typeof AuthAPI.login === 'function') {
        try {
          const res = await AuthAPI.login({ email, password });

          // OTP flow: /login returns a message but no token/user yet — prompt
          // for the emailed code. After verification, the admin is signed in.
          if (res && res.otpRequired) {
            if (window.Modal && typeof Modal.openOtpVerify === 'function') {
              Modal.openOtpVerify(email);
              if (window.Toast) Toast.info(res.message || 'Enter the verification code sent to your email.');
            } else if (errEl) {
              errEl.textContent = 'Verification code required. Please use the storefront sign-in to enter the code sent to your email.';
              errEl.classList.remove('hidden');
            }
            return;
          }

          const user = this.getUser();
          if (user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN')) {
            this.reloadOrNavigate();
          } else {
            if (errEl) {
              errEl.textContent = 'This account does not have Admin privileges. Role: ' + (user?.role || 'USER') + '. Please use an admin account.';
              errEl.classList.remove('hidden');
            }
            AuthAPI.logout();
          }
        } catch (apiErr) {
          if (errEl) {
            errEl.textContent = 'Login failed. ' + (apiErr.message || 'Please check your credentials.');
            errEl.classList.remove('hidden');
          }
        }
      } else {
        if (errEl) {
          errEl.textContent = 'Authentication service is not available. Please ensure the backend is running.';
          errEl.classList.remove('hidden');
        }
      }
    } catch (err) {
      console.warn('[AuthGuard] Login error:', err);
      if (errEl) {
        errEl.textContent = 'Could not connect to backend. Please ensure Spring Boot is running.';
        errEl.classList.remove('hidden');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-1.5"></i> Sign In to Dashboard';
      }
    }
  },

  reloadOrNavigate() {
    if (window.Admin && typeof window.Admin.renderChrome === 'function') {
      window.Admin.renderChrome();
      window.Admin.switchTab('dashboard');
    } else {
      window.location.reload();
    }
  }
};

window.AuthGuard = AuthGuard;