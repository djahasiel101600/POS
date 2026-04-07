import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/shared/types'
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/shared/config'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, access: string, refresh: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, access, refresh) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, access)
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
        set({ user, accessToken: access, isAuthenticated: true })
      },
      clearAuth: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        set({ user: null, accessToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'pos-auth',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
