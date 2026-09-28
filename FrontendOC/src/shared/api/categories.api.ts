import { axiosClient } from '@/shared/api/axiosClient'
import type { Category } from '@/shared/types'

export const categoriesApi = {
  getAll: () =>
    axiosClient.get<Category[]>('/categories'),

  getTopLevel: () =>
    axiosClient.get<Category[]>('/categories/top-level'),

  getById: (id: number) =>
    axiosClient.get<Category>(`/categories/${id}`),

  getSubcategories: (id: number) =>
    axiosClient.get<Category[]>(`/categories/${id}/subcategories`),

  create: (data: { categoryName: string; parentCategoryId?: number | null; description?: string }) =>
    axiosClient.post<Category>('/categories', data),

  update: (id: number, data: { categoryName: string; parentCategoryId?: number | null; description?: string }) =>
    axiosClient.put<Category>(`/categories/${id}`, data),

  delete: (id: number) =>
    axiosClient.delete(`/categories/${id}`),
}
