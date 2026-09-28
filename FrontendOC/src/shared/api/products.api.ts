import { axiosClient } from '@/shared/api/axiosClient'
import type { Product } from '@/shared/types'

export const productsApi = {
  getAll: () =>
    axiosClient.get<Product[]>('/products'),

  getById: (id: number) =>
    axiosClient.get<Product>(`/products/${id}`),

  getByCategory: (categoryId: number) =>
    axiosClient.get<Product[]>(`/products/category/${categoryId}`),

  search: (keyword: string) =>
    axiosClient.get<Product[]>('/products/search', { params: { keyword } }),

  create: (formData: FormData) =>
    axiosClient.post<Product>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, formData: FormData) =>
    axiosClient.put<Product>(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  updateDiscount: (id: number, discountPercentage: number) =>
    axiosClient.put<Product>(`/products/${id}/discount`, { discountPercentage }),

  updateDiscountByCategory: (categoryId: number, discountPercentage: number) =>
    axiosClient.put<Product[]>(`/products/category/${categoryId}/discount`, { discountPercentage }),

  delete: (id: number) =>
    axiosClient.delete(`/products/${id}`),
}
