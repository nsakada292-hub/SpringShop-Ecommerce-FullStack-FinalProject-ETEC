import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '@/shared/types'
import { authApi } from '@/shared/api/auth.api'
import { storeTokens, clearAuth, getStoredTokens } from '@/shared/api/axiosClient'
import { usersApi } from '@/shared/api/users.api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<string>
  register: (name: string, email: string, password: string) => Promise<string>
  verifyOtp: (email: string, otpCode: string) => Promise<User>
  sendOtp: (email: string) => Promise<string>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ss_user')
    if (saved) {
      try { return JSON.parse(saved) } catch { return null }
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    try {
      const tokens = getStoredTokens()
      if (!tokens?.token) {
        setIsLoading(false)
        return
      }
      const { data } = await usersApi.getMe()
      setUser(data)
      localStorage.setItem('ss_user', JSON.stringify(data))
    } catch {
      clearAuth()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email: string, password: string): Promise<string> => {
    const { data } = await authApi.login({ email, password })
    return data.message
  }

  const register = async (name: string, email: string, password: string): Promise<string> => {
    const { data } = await authApi.register({ name, email, password })
    return data.message
  }

  const verifyOtp = async (email: string, otpCode: string) => {
    const { data } = await authApi.verifyOtp(email, otpCode)
    storeTokens(data.token, data.refreshToken)
    setUser(data.user)
    localStorage.setItem('ss_user', JSON.stringify(data.user))
    return data.user
  }

  const sendOtp = async (email: string): Promise<string> => {
    const { data } = await authApi.sendOtp(email)
    return data.message
  }

  const logout = async () => {
    const tokens = getStoredTokens()
    if (tokens?.refreshToken) {
      try { await authApi.logout(tokens.refreshToken) } catch { /* ignore */ }
    }
    clearAuth()
    setUser(null)
  }

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await usersApi.getMe()
      setUser(data)
      localStorage.setItem('ss_user', JSON.stringify(data))
    } catch {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        verifyOtp,
        sendOtp,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
