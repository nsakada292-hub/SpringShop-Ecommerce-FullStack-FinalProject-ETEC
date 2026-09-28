import axios from 'axios'
import type { RefreshTokenResponse } from '@/shared/types'

const API_BASE_URL = '/api'

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

axiosClient.interceptors.request.use(
  (config) => {
    const tokens = getStoredTokens()
    if (tokens?.token) {
      config.headers.Authorization = `Bearer ${tokens.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const tokens = getStoredTokens()
      if (!tokens?.refreshToken) {
        isRefreshing = false
        clearAuth()
        window.location.href = '/sign-in'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken: tokens.refreshToken }
        )

        storeTokens(data.token, data.refreshToken)
        processQueue(null, data.token)

        originalRequest.headers.Authorization = `Bearer ${data.token}`
        return axiosClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuth()
        window.location.href = '/sign-in'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

function getStoredTokens(): { token: string; refreshToken: string } | null {
  try {
    const token = localStorage.getItem('ss_access_token')
    const refreshToken = localStorage.getItem('ss_refresh_token')
    if (token && refreshToken) {
      return { token, refreshToken }
    }
    return null
  } catch {
    return null
  }
}

function storeTokens(token: string, refreshToken: string) {
  localStorage.setItem('ss_access_token', token)
  localStorage.setItem('ss_refresh_token', refreshToken)
}

function clearAuth() {
  localStorage.removeItem('ss_access_token')
  localStorage.removeItem('ss_refresh_token')
  localStorage.removeItem('ss_user')
}

export { axiosClient, storeTokens, clearAuth, getStoredTokens }
export default axiosClient
