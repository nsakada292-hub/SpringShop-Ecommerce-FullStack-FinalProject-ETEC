import { axiosClient } from '@/shared/api/axiosClient'
import type { User } from '@/shared/types'

export const usersApi = {
  getMe: () =>
    axiosClient.get<User>('/users/me'),

  updateMe: (data: { name: string; email: string; phone?: string; bio?: string; address?: string; gender?: string; dateOfBirth?: string }) =>
    axiosClient.put<User>('/users/me', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return axiosClient.post<User>('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    axiosClient.put('/users/me/password', data),

  getAll: () =>
    axiosClient.get<User[]>('/users'),

  getById: (id: number) =>
    axiosClient.get<User>(`/users/${id}`),

  updateRole: (id: number, role: string) =>
    axiosClient.patch<User>(`/users/${id}/role`, { role }),
}
