import axiosClient from './axiosClient';
import { User } from '../types';

export const userApi = {
  getMyProfile: async () => {
    const res = await axiosClient.get<User>('/users/me');
    return res.data;
  },

  updateMyProfile: async (data: { name: string; email: string }) => {
    const res = await axiosClient.put<User>('/users/me', data);
    return res.data;
  },

  changePassword: async (data: { currentPassword?: string; newPassword: string }) => {
    await axiosClient.put('/users/me/password', data);
  },

  getAll: async () => {
    const res = await axiosClient.get<User[]>('/users');
    return res.data;
  },

  toggleRole: async (id: number) => {
    const res = await axiosClient.patch<User>(`/users/${id}/role`);
    return res.data;
  },

  updateRole: async (id: number, role: 'USER' | 'ADMIN') => {
    const res = await axiosClient.patch<User>(`/users/${id}/role`, { role });
    return res.data;
  }
};
