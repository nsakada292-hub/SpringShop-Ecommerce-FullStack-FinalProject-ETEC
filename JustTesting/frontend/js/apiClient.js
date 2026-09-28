/**
 * apiClient.js
 * ---------------------------------------------------------------------------
 * Single shared entry point for every HTTP call the frontend makes to the
 * Spring Boot backend. Nothing about the backend is changed here — this file
 * only standardises how the existing endpoints are called from the browser:
 *   - one place to set the API base URL
 *   - one place to attach the JWT "Authorization" header
 *   - one place to parse JSON / surface errors / handle loading state
 *
 * Every other file in js/api/ (authApi.js, productApi.js, ...) is a thin
 * wrapper around request() below and maps 1:1 to a real backend controller.
 * ---------------------------------------------------------------------------
 */

// Change this if your backend runs on a different host/port.
export const API_BASE = 'http://localhost:8080/api';

// The key we write new tokens to. We also *read* a couple of legacy keys
// below so a token saved by an older version of this project still works.
const TOKEN_KEY = 'springshop_token';
const LEGACY_TOKEN_KEYS = ['token', 'accessToken'];

/* --------------------------------- Token --------------------------------- */

export function getToken() {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    LEGACY_TOKEN_KEYS.map((k) => localStorage.getItem(k)).find(Boolean) ||
    null
  );
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  LEGACY_TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
}

export function isLoggedIn() {
  return !!getToken();
}

export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* ------------------------------ Error type ------------------------------- */

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/* -------------------------------- Request -------------------------------- */

/**
 * @param {string} path       Path relative to API_BASE, e.g. "/products"
 * @param {object} options
 * @param {'GET'|'POST'|'PUT'|'DELETE'|'PATCH'} [options.method='GET']
 * @param {object|FormData|null} [options.body=null]  JSON body or a FormData
 *        instance (used as-is for multipart endpoints like product image
 *        upload — Content-Type is left for the browser to set in that case).
 * @param {boolean} [options.auth=true]   Attach the Authorization header if
 *        a token is present. Safe to leave true even for public endpoints.
 * @param {boolean} [options.parseJson=true] Parse and return the JSON body.
 *        Set to false for endpoints that respond 204 No Content.
 */
export async function request(path, options = {}) {
  const { method = 'GET', body = null, auth = true, parseJson = true } = options;

  const isFormData = body instanceof FormData;
  const headers = {
    ...(auth ? getAuthHeader() : {}),
    ...(isFormData ? {} : body != null ? { 'Content-Type': 'application/json' } : {}),
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body == null ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch (networkErr) {
    // Backend unreachable (offline, CORS, wrong port, etc.)
    throw new ApiError(
      'Could not reach the server. Please check your connection and try again.',
      0,
      networkErr
    );
  }

  if (res.status === 204) return null;

  const contentType = res.headers.get('content-type') || '';
  const raw = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message =
      (raw && typeof raw === 'object' && (raw.message || raw.error)) ||
      (typeof raw === 'string' && raw) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, raw);
  }

  return parseJson ? raw : null;
}

export const apiGet = (path, options = {}) => request(path, { ...options, method: 'GET' });
export const apiPost = (path, body, options = {}) => request(path, { ...options, method: 'POST', body });
export const apiPut = (path, body, options = {}) => request(path, { ...options, method: 'PUT', body });
export const apiDelete = (path, options = {}) => request(path, { ...options, method: 'DELETE', parseJson: false });