import axiosClient from './axiosClient';
import { Review } from '../types';

export const reviewApi = {
  create: async (data: { productId: number; rating: number; comment: string }) => {
    const res = await axiosClient.post<Review>('/reviews', data);
    return res.data;
  },

  getAll: async (limit?: number) => {
    const res = await axiosClient.get<Review[]>('/reviews', { params: { limit } });
    return res.data;
  },

  getByProduct: async (productId: number) => {
    const res = await axiosClient.get<Review[]>(`/reviews/product/${productId}`);
    return res.data;
  },

  getAverageRating: async (productId: number) => {
    const res = await axiosClient.get<number>(`/reviews/product/${productId}/average`);
    return res.data;
  },

  delete: async (id: number) => {
    await axiosClient.delete(`/reviews/${id}`);
  }
};
