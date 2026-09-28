import axiosClient from './axiosClient';
import { DashboardStats, NotificationItem, StoreSettings } from '../types';

export const dashboardApi = {
  getStats: async () => {
    const res = await axiosClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },

  getNotifications: async () => {
    const res = await axiosClient.get<NotificationItem[]>('/notifications');
    return res.data;
  },

  markNotificationsAsRead: async () => {
    await axiosClient.patch('/notifications/mark-read');
  },

  getSettings: async () => {
    const res = await axiosClient.get<StoreSettings>('/settings');
    return res.data;
  },

  updateSettings: async (settings: Partial<StoreSettings>) => {
    const res = await axiosClient.put<StoreSettings>('/settings', settings);
    return res.data;
  }
};
