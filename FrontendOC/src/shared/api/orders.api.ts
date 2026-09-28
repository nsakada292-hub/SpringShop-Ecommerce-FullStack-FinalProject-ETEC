import { axiosClient } from '@/shared/api/axiosClient'
import type { Order } from '@/shared/types'

export interface CreateOrderPayload {
  shippingAddress: string
  recipientName: string
  recipientEmail: string
  recipientPhone: string
  latitude: number | null
  longitude: number | null
  notes?: string
  couponCode?: string
}

export const ordersApi = {
  getMyOrders: () =>
    axiosClient.get<Order[]>('/orders/me'),

  getById: (id: number) =>
    axiosClient.get<Order>(`/orders/${id}`),

  create: (payload: CreateOrderPayload) =>
    axiosClient.post<Order>('/orders', payload),

  updateStatus: (id: number, status: string) =>
    axiosClient.put<Order>(`/orders/${id}/status`, null, { params: { status } }),

  cancel: (id: number) =>
    axiosClient.put(`/orders/${id}/cancel`),

  getAll: () =>
    axiosClient.get<Order[]>('/orders/all'),
}
