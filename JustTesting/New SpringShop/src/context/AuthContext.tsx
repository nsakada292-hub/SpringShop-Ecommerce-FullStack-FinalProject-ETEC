import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';
import { authApi } from '../api/authApi';
import { userApi } from '../api/userApi';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ message: string; demoOtp?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ message: string; demoOtp?: string }>;
  verifyOtp: (email: string, otpCode: string) => Promise<User>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('springshop_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    // Default initial mock logged-in user for effortless previewing: Dara Customer
    return {
      id: 2,
      name: 'Dara Customer',
      email: 'customer@springshop.com',
      role: 'USER',
      createdAt: '2026-01-15T00:00:00'
    };
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('springshop_token') || 'demo-token-customer';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('springshop_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('springshop_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('springshop_token', token);
    } else {
      localStorage.removeItem('springshop_token');
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.register({ name, email, password });
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otpCode: string) => {
    setIsLoading(true);
    try {
      const res: AuthResponse = await authApi.verifyOtp({ email, otpCode });
      setToken(res.token);
      localStorage.setItem('springshop_token', res.token);
      localStorage.setItem('springshop_refresh_token', res.refreshToken);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('springshop_token');
    localStorage.removeItem('springshop_refresh_token');
    localStorage.removeItem('springshop_user');
  };

  const refreshUser = async () => {
    try {
      const profile = await userApi.getMyProfile();
      setUser(profile);
    } catch (err) {
      console.warn('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'ADMIN',
      isLoading,
      login,
      register,
      verifyOtp,
      logout,
      setUser,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
