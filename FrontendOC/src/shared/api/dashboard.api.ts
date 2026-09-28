import { axiosClient } from '@/shared/api/axiosClient'
import type { DashboardStats } from '@/shared/types'

export const dashboardApi = {
  getStats: () =>
    axiosClient.get<DashboardStats>('/dashboard/stats'),
}
