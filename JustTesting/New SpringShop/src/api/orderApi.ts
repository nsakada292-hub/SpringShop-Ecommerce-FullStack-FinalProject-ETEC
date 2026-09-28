import axiosClient from './axiosClient';
import { Order, OrderStatus } from '../types';

export const orderApi = {
  create: async (data: any) => {
    const res = await axiosClient.post<Order>('/orders', data);
    return res.data;
  },

  placeOrder: async (shippingAddress: string) => {
    const res = await axiosClient.post<Order>('/orders', { shippingAddress });
    return res.data;
  },

  getById: async (id: number) => {
    const res = await axiosClient.get<Order>(`/orders/${id}`);
    return res.data;
  },

  getMyOrders: async () => {
    const res = await axiosClient.get<Order[]>('/orders/me');
    return res.data;
  },

  getAll: async () => {
    const res = await axiosClient.get<Order[]>('/orders/all');
    return res.data;
  },

  updateStatus: async (id: number, status: OrderStatus) => {
    const res = await axiosClient.put<Order>(`/orders/${id}/status`, null, {
      params: { status }
    });
    return res.data;
  },

  cancelOrder: async (id: number) => {
    await axiosClient.put(`/orders/${id}/cancel`);
  }
};
