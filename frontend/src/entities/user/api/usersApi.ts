import { apiClient } from '@/shared/api/client'
import type { User } from '@/shared/types'

export const usersApi = {
  getAll: async (params?: Record<string, string>) => {
    const { data } = await apiClient.get<User[]>('/users/', { params })
    return data
  },
  create: async (payload: { username: string; full_name: string; role: string; password: string }) => {
    const { data } = await apiClient.post<User>('/users/', payload)
    return data
  },
  update: async (id: number, payload: Partial<User>) => {
    const { data } = await apiClient.patch<User>(`/users/${id}/`, payload)
    return data
  },
  resetPassword: async (id: number, new_password: string) => {
    await apiClient.patch(`/users/${id}/reset-password/`, { new_password })
  },
}
