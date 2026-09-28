import { axiosClient } from '@/shared/api/axiosClient'
import type { Coupon } from '@/shared/types'

export const newsletterApi = {
  subscribe: (email: string) =>
    axiosClient.post<Coupon>('/newsletter/subscribe', { email }),

  getMyCoupons: () =>
    axiosClient.get<Coupon[]>('/users/me/coupons'),
}

export const couponApi = {
  validate: (code: string) =>
    axiosClient.post<Coupon>('/coupons/validate', { code }),
}