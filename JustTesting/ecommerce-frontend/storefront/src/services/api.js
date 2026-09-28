import axios from "axios";

// Central auth storage keys, shared with AuthContext.
export const TOKEN_KEY = "auth_token";
export const REFRESH_KEY = "auth_refresh_token";
export const USER_KEY = "auth_user";

export const storageKeys = { TOKEN_KEY, REFRESH_KEY, USER_KEY };

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the access token to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 on a request that *sent* a token means the session is
// invalid/expired → clear auth and send the user to sign in. A 401 for
// an anonymous request (e.g. the guest cart/love-list endpoints) is
// left alone so pages can degrade to empty state instead of bouncing.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      Object.values(storageKeys).forEach((k) => localStorage.removeItem(k));
      if (window.location.pathname !== "/sign-in") {
        const redirect = encodeURIComponent(
          `${window.location.pathname}${window.location.search}`
        );
        window.location.href = `/sign-in?redirect=${redirect}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;