import { axiosClient } from '@/shared/api/axiosClient'
import type { WishlistItem } from '@/shared/types'

export const wishlistApi = {
  get: () =>
    axiosClient.get<WishlistItem[]>('/wishlist'),

  add: (productId: number) =>
    axiosClient.post<WishlistItem[]>(`/wishlist/${productId}`),

  remove: (productId: number) =>
    axiosClient.delete<WishlistItem[]>(`/wishlist/${productId}`),
}