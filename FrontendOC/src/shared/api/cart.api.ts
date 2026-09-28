import { axiosClient } from '@/shared/api/axiosClient'
import type { Cart } from '@/shared/types'

export const cartApi = {
  get: () =>
    axiosClient.get<Cart>('/cart'),

  addItem: (productId: number, quantity: number) =>
    axiosClient.post<Cart>('/cart/items', { productId, quantity }),

  updateQuantity: (cartItemId: number, quantity: number) =>
    axiosClient.put<Cart>(`/cart/items/${cartItemId}`, null, { params: { quantity } }),

  removeItem: (cartItemId: number) =>
    axiosClient.delete<Cart>(`/cart/items/${cartItemId}`),

  clear: () =>
    axiosClient.delete('/cart'),
}
