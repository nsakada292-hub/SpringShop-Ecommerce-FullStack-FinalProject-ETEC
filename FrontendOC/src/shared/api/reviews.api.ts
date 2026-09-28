import { axiosClient } from '@/shared/api/axiosClient'
import type { Review } from '@/shared/types'

export const reviewsApi = {
  getByProduct: (productId: number) =>
    axiosClient.get<Review[]>(`/reviews/product/${productId}`),

  getAverageRating: (productId: number) =>
    axiosClient.get<number>(`/reviews/product/${productId}/average`),

  create: (data: { productId: number; rating: number; comment: string }) =>
    axiosClient.post<Review>('/reviews', data),

  update: (id: number, data: { productId: number; rating: number; comment: string }) =>
    axiosClient.put<Review>(`/reviews/${id}`, data),

  delete: (id: number) =>
    axiosClient.delete(`/reviews/${id}`),
}
