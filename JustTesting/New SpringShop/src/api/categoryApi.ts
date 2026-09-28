import axiosClient from './axiosClient';
import { Category } from '../types';

export const categoryApi = {
  getAll: async (type?: string) => {
    const res = await axiosClient.get<Category[]>('/categories', { params: { type } });
    return res.data;
  },

  getTopLevel: async () => {
    const res = await axiosClient.get<Category[]>('/categories/top-level');
    return res.data;
  },

  getById: async (id: number) => {
    const res = await axiosClient.get<Category>(`/categories/${id}`);
    return res.data;
  },

  getSubCategories: async (id: number) => {
    const res = await axiosClient.get<Category[]>(`/categories/${id}/subcategories`);
    return res.data;
  },

  create: async (data: { categoryName: string; parentCategoryId?: number | null; description?: string }) => {
    const res = await axiosClient.post<Category>('/categories', data);
    return res.data;
  },

  update: async (id: number, data: { categoryName: string; parentCategoryId?: number | null; description?: string }) => {
    const res = await axiosClient.put<Category>(`/categories/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    await axiosClient.delete(`/categories/${id}`);
  }
};
