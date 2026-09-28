import { axiosClient } from '@/shared/api/axiosClient'
import type { AuthResponse } from '@/shared/types'

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    axiosClient.post<{ message: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    axiosClient.post<{ message: string }>('/auth/login', data),

  sendOtp: (email: string) =>
    axiosClient.post<{ message: string }>('/auth/send-otp', { email }),

  verifyOtp: (email: string, otpCode: string) =>
    axiosClient.post<AuthResponse>('/auth/verify-otp', { email, otpCode }),

  refreshToken: (refreshToken: string) =>
    axiosClient.post<{ token: string; refreshToken: string; tokenType: string; expiresIn: number }>(
      '/auth/refresh',
      { refreshToken }
    ),

  logout: (refreshToken: string) =>
    axiosClient.post<{ message: string }>('/auth/logout', { refreshToken }),
}
