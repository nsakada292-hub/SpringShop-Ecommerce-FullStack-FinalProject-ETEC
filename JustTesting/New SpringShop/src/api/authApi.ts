import axiosClient from './axiosClient';
import { AuthResponse } from '../types';

export const authApi = {
  register: async (data: { name?: string; email: string; password: string }) => {
    const res = await axiosClient.post<{ message: string; demoOtp?: string }>('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await axiosClient.post<{ message: string; demoOtp?: string }>('/auth/login', data);
    return res.data;
  },

  sendOtp: async (email: string) => {
    const res = await axiosClient.post<{ message: string; demoOtp?: string }>('/auth/send-otp', { email });
    return res.data;
  },

  verifyOtp: async (data: { email: string; otpCode: string }) => {
    const res = await axiosClient.post<AuthResponse>('/auth/verify-otp', data);
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await axiosClient.post<{ message: string; demoOtp?: string }>('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: { email: string; otpCode: string; newPassword: string }) => {
    const res = await axiosClient.post<{ message: string }>('/auth/reset-password', data);
    return res.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await axiosClient.post('/auth/refresh', { refreshToken });
    return res.data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('springshop_refresh_token');
    try {
      await axiosClient.post('/auth/logout', { refreshToken });
    } catch {
      // ignore
    }
  }
};
