/**
 * authGuard.js
 * ---------------------------------------------------------------------------
 * Client-side route guarding. The REAL security boundary is the backend
 * (JwtAuthFilter + SecurityConfig hasRole("ADMIN")), but this module provides
 * defense-in-depth and correct UX:
 *   - an admin page never renders for a signed-out customer
 *   - a customer can't reach the admin dashboard by editing the URL / manually
 *     navigating to admin.html
 *   - the "Admin dashboard" link only appears for actual admins
 *
 * IMPORTANT: this is NOT a security boundary. Anyone can view/execute client
 * code. The backend must keep rejecting non-admin calls (it already does).
 * ---------------------------------------------------------------------------
 */
import { isLoggedIn, getToken } from './apiClient.js';
import { getUser, isAdmin, logout } from './authApi.js';

/**
 * Returns the saved user object or null.
 */
export function currentUser() {
  return getUser();
}

/**
 * True if a token exists AND we recorded an ADMIN user.
 */
export function isAdminUser() {
  return isLoggedIn() && isAdmin();
}

/**
 * True if any user is signed in (admin or customer).
 */
export function isAuthenticated() {
  return isLoggedIn();
}

/**
 * Gate for a protected page. If the caller isn't an admin, we optionally show a
 * blocking screen and redirect.
 *
 * @param {object} opts
 * @param {string} [opts.blockElId]      id of a container to inject the blocked message into
 * @param {string} [opts.loginUrl]       where to send a signed-out user
 * @param {string} [opts.homeUrl]        where to send a signed-in non-admin (customer)
 * @returns {boolean} true if the current user may proceed
 */
export function requireAdminPage({
  blockElId,
  loginUrl = 'login.html',
  homeUrl = 'index.html',
} = {}) {
  if (!isAuthenticated()) {
    redirectOrBlock(blockElId, 'You must sign in to access admin.', loginUrl, isAuthenticated());
    return false;
  }
  if (!isAdmin()) {
    redirectOrBlock(blockElId, 'Access denied — you do not have administrator permissions.', homeUrl, isAuthenticated());
    return false;
  }
  return true;
}

function redirectOrBlock(blockElId, message, redirectUrl, authenticated) {
  if (blockElId && document.getElementById(blockElId)) {
    renderBlocked(el(blockElId), message);
    return;
  }
  // If there's a target container, we render the block immediately; otherwise
  // redirect after a short delay so the message can be painted.
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 1500);
}

function renderBlocked(container, message) {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div class="w-16 h-16 rounded-2xl bg-rose-600/10 text-rose-600 flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 15v2m0 0h.01M12 5v8m-7 2a7 7 0 1114 0 7 7 0 01-14 0z"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-slate-800 mb-2">Access Denied</h1>
      <p class="text-slate-500 max-w-md mb-6">${message}</p>
      <div class="flex gap-3">
        <a href="page/login.html" class="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition">Sign in</a>
        <a href="index.html" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">Back to shop</a>
      </div>
    </div>
  `;
}

function el(id) {
  return document.getElementById(id);
}

/** Convenience: sign out and go to the login page. */
export function signOutAndRedirect(url = 'page/login.html') {
  logout();
  window.location.href = url;
}

// Also expose on window for use from inline (non-module) handlers.
window.AuthGuard = {
  isLoggedIn,
  isAuthenticated: () => isAuthenticated(),
  isAdmin: () => isAdminUser(),
  getUser,
  requireAdminPage,
  signOutAndRedirect,
};
