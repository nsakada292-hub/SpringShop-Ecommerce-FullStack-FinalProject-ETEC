import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { getProfile, logout as logoutApi } from "../services/authService";
import { storageKeys } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKeys.USER_KEY)) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem(storageKeys.TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState(() =>
    localStorage.getItem(storageKeys.REFRESH_KEY)
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      let active = true;
      setLoading(true);
      getProfile()
        .then((res) => {
          if (!active) return;
          setUser(res.data);
          localStorage.setItem(storageKeys.USER_KEY, JSON.stringify(res.data));
        })
        .catch(() => {
          if (active) logout();
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
    }
  }, [token]);

  const loginUser = useCallback((userData, authToken, refresh = null) => {
    setUser(userData || null);
    setToken(authToken || null);
    setRefreshToken(refresh);
    if (userData) {
      localStorage.setItem(storageKeys.USER_KEY, JSON.stringify(userData));
    }
    if (authToken) {
      localStorage.setItem(storageKeys.TOKEN_KEY, authToken);
    }
    if (refresh) {
      localStorage.setItem(storageKeys.REFRESH_KEY, refresh);
    }
  }, []);

  const logout = useCallback(() => {
    // Best-effort server-side revocation of the refresh token.
    if (refreshToken) {
      logoutApi(refreshToken).catch(() => {});
    }
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    Object.values(storageKeys).forEach((k) => localStorage.removeItem(k));
  }, [refreshToken]);

  const isAuthenticated = !!token;
  const isAdmin = user?.role === "ADMIN";

  const value = useMemo(
    () => ({
      user,
      token,
      refreshToken,
      loading,
      isAuthenticated,
      isAdmin,
      loginUser,
      logout,
      setUser,
    }),
    [user, token, refreshToken, loading, isAuthenticated, isAdmin, loginUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}