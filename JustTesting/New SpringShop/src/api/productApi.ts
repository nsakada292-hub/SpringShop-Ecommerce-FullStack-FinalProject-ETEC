import axiosClient from './axiosClient';
import { Product } from '../types';

export interface ProductQueryParams {
  category?: string;
  type?: string;
  search?: string;
  sortBy?: 'price-low' | 'price-high' | 'newest';
  limit?: number;
}

export const productApi = {
  getAll: async (params?: ProductQueryParams) => {
    const res = await axiosClient.get<Product[]>('/products', { params });
    return res.data;
  },

  getById: async (id: number) => {
    const res = await axiosClient.get<Product>(`/products/${id}`);
    return res.data;
  },

  getByCategory: async (categoryId: number) => {
    const res = await axiosClient.get<Product[]>(`/products/category/${categoryId}`);
    return res.data;
  },

  search: async (keyword: string) => {
    const res = await axiosClient.get<Product[]>('/products/search', { params: { keyword } });
    return res.data;
  },

  create: async (data: Partial<Product>) => {
    const res = await axiosClient.post<Product>('/products', data);
    return res.data;
  },

  update: async (id: number, data: Partial<Product>) => {
    const res = await axiosClient.put<Product>(`/products/${id}`, data);
    return res.data;
  },

  delete: async (id: number) => {
    await axiosClient.delete(`/products/${id}`);
  }
};
