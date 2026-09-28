import { axiosClient } from '@/shared/api/axiosClient'
import type { PaymentCurrency, PaymentInitiateResponse, PaymentStatusResponse } from '@/shared/types'

export const paymentsApi = {
  initiate: (orderId: number, currency: PaymentCurrency) =>
    axiosClient.post<PaymentInitiateResponse>('/payments/initiate', { orderId, currency }),

  checkStatus: (orderId: number) =>
    axiosClient.post<PaymentStatusResponse>('/payments/status', { orderId }),
}