import { apiClient } from '@/shared/api/client'
import type { LoginResponse } from '@/shared/types'

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/login/', { username, password })
    return data
  },
  logout: async (refresh: string) => {
    await apiClient.post('/auth/logout/', { refresh })
  },
  me: async () => {
    const { data } = await apiClient.get('/auth/me/')
    return data
  },
}
