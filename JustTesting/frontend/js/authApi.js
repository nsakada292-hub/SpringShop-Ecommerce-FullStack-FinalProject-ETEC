/**
 * authApi.js — maps to AuthController (/api/auth)
 *
 *   POST /api/auth/register   register(payload)
 *   POST /api/auth/login      login(payload)
 *
 * Both endpoints return an AuthResponse. This module assumes that response
 * contains the JWT under one of `token` / `accessToken` / `jwt` — whichever
 * field your AuthResponse actually uses will be picked up automatically.
 * The raw response is always returned too, so callers can read any other
 * fields (user id, role, etc.) your backend includes.
 */
import { apiPost, setToken, clearToken } from './apiClient.js';

const USER_KEY = 'springshop_user';

function extractToken(authResponse) {
  if (!authResponse) return null;
  return authResponse.token || authResponse.accessToken || authResponse.jwt || null;
}

/**
 * Persist the signed-in user (especially their role) alongside the token so the
 * UI can route correctly (admin vs customer). Never store the password — only
 * the fields the backend's UserResponse exposes (id, name, email, role).
 */
function persistUser(authResponse) {
  if (!authResponse) return;
  const user = authResponse.user || null;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isAdmin() {
  const user = getUser();
  return !!(user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN'));
}

export function clearUser() {
  localStorage.removeItem(USER_KEY);
}

/** @param {{name?:string, username?:string, email:string, password:string}} payload */
export async function register(payload) {
  const res = await apiPost('/auth/register', payload, { auth: false });
  const token = extractToken(res);
  if (token) setToken(token);
  return res;
}

/** @param {{email:string, password:string}} payload */
export async function login(payload) {
  const res = await apiPost('/auth/login', payload, { auth: false });
  const token = extractToken(res);
  if (token) setToken(token);
  persistUser(res);
  return res;
}

export function logout() {
  clearToken();
  clearUser();
}

export { isLoggedIn } from './apiClient.js';